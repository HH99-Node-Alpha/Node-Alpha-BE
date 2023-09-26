import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { Application } from 'express';
import prisma from './utils/prisma';
import UsersRepository from './repositories/users';

const usersRepository = new UsersRepository();
const interval: number = 3000;

const WebSocket = (server: HttpServer, app: Application) => {
  const io = new SocketServer(server, {
    path: '/socket.io',
    cors: {
      origin: '*',
    },
  });
  app.set('io', io);
  const board = io.of('/board');
  const event = io.of('/main'); // for '워크스페이스'초대

  /** 1. board접속 및 컬럼 순서 변경 */
  board.on('connection', (socket: any) => {
    console.log('board접속:', socket.id);
    socket.on('disconnect', () => {
      console.log('board접속해제', socket.id);
      clearInterval(interval);
    });

    socket.on('error', (error: any) => {
      console.error(error);
    });

    socket.on('join', (boardId: any) => {
      socket.join(boardId); // 전달받은 boardRoomId에 접속
      socket.emit('join', {
        message: `(본인)${socket.id}님은 ${boardId}번 board에 입장했습니다`,
      });
      socket.to(boardId).emit('join', {
        message: `(타인)${socket.id}님이 ${boardId}번 board에 입장했습니다`,
      });

      // 1-1.칼럼 추가
      socket.on('addToServer', async (data: any) => {
        console.log('from서버:', data);
        socket.emit('addToClient', '본인이 추가');
        socket.to(boardId).emit('addToClient', '타인이 추가');
      });

      // 1-2.칼럼 수정
      socket.on('changeToServer', async (data: any) => {
        console.log('from서버:', data);
        // socket.emit('changeToClient', '본인이 순서 변경');
        // socket.to(boardId).emit('changeToClient', '타인이 순서 변경');
      });

      // 1-3.칼럼 삭제
      socket.on('deleteToServer', async (data: any) => {
        console.log('from서버:', data);
        socket.emit('deleteToClient', '본인이 삭제');
        socket.to(boardId).emit('deleteToClient', '타인이 삭제');
      });
    });
  });

  // event에서 clients정보 관리할 객체 선언 (key: socket.id, value: userId)
  const clients: any = {};
  /** 2. event - 초대 */
  event.on('connection', (socket: any) => {
    console.log('event접속:', socket.id);

    socket.on('error', (error: any) => {
      console.error(error);
    });

    socket.on('join', (roomName: any) => {
      socket.join(roomName);

      // A. loginAndAlarm
      // main접속 -> (1)가장 최근 로그인 기록이 나오고 & (2)접속끊은 이후에 온 초대 메세지 확인
      socket.on('loginAndAlarm', async (data: any) => {
        const user = await usersRepository.getUser(data);
        socket.user = user; // lastLogin담을 용도
        clients[socket.user.userId] = socket.id;
        console.log(clients);
        console.log(clients[socket.user.userId]);

        const loginLog = user?.lastLogin || null;
        const userName = user?.name;
        const invitations = await usersRepository.getInvitations(
          data,
          userName,
        );

        let inviteResult: any = '';
        // 1)초대목록이 없는 경우
        if (!invitations.length) {
          inviteResult = '초대받은 알람이 없습니다';
          socket.emit('loginAndAlarm', { loginLog, inviteResult });
        }
        // 2)초대목록이 있다면
        else {
          // 2-1)접속한 적이 있으면
          if (loginLog) {
            inviteResult = invitations.filter(
              (invitation: any) =>
                new Date(invitation.createdAt) > new Date(loginLog),
            );
            // 2-2)최초 접속(회원가입만 하고, 접속x경우 -> loginLog가 없음)
          } else {
            inviteResult = invitations;
          }
          socket.emit('loginAndAlarm', { loginLog, inviteResult });
        }
      });

      // B. 초대 알람
      socket.on('invite', async (inviteInfo: any) => {
        const Invitation = await usersRepository.createInvitations(
          inviteInfo.workspaceId,
          inviteInfo.invitedUserId, // 초대한 사람
          inviteInfo.invitedByUserId, // 초대 받은 사람
        );

        const workspace = await prisma.workspaces.findUnique({
          where: { workspaceId: inviteInfo.workspaceId },
        });

        const workspaceName = workspace?.workspaceName;
        const user = await usersRepository.getUser(inviteInfo.invitedUserId);
        inviteInfo['workspaceName'] = workspaceName;
        inviteInfo['invitationId'] = Invitation.invitationId;
        inviteInfo['userName'] = user?.name;
        console.log('inviteInfo:', inviteInfo);

        const invitedByUserIdSocketId = clients[inviteInfo.invitedByUserId];
        console.log('socket?:', invitedByUserIdSocketId);
        socket.to(invitedByUserIdSocketId).emit('invite', inviteInfo);
      });

      // *C. Notification확인 = isRead:true
      socket.on('notification', async (invitationIds: any) => {
        // invitationIds: notification안에 들어있는 invitation의 ID들이 담긴 '배열'
        const changedInvitations = await usersRepository.chekcNotification(
          socket.user.userId,
          invitationIds,
        );
        socket.emit('notification', changedInvitations);
      });

      // D. 초대 승낙/거절
      socket.on('confirmInvitation', async (data: any) => {
        if (data.accepted) {
          console.log('data:', data);
          await usersRepository.createWorkspaceMember(
            data.workspaceId,
            data.invitedByUserId,
          );
          await usersRepository.acceptInvitations(
            data.invitationId,
            data.accepted,
          );
          socket.emit('confirmInvitation', '초대를 승낙하였습니다');
        } else {
          const deletedAt = new Date(); // Soft delete
          await usersRepository.declineInvitations(
            data.invitationId,
            data.accepted,
            deletedAt,
          );
          socket.emit('confirmInvitation', '초대를 거절하였습니다');
        }
      });
    });

    // *E. 워크스페이스 이름, 이미지 변경
    socket.on('updateWorkspace', async (data: any) => {
      // data에는 workspaceId, workspaceName, workspaceImage가 있어야 함
      const result = await usersRepository.updateWorkspace(
        socket.user.userId,
        data.workspaceId,
        data.workspaceName,
        data.workspaceImage,
      );

      io.emit('updateWorkspace', result); // 전체에게 가도록 emit
    });

    socket.on('disconnect', async () => {
      console.log('event접속해제: ', socket.id);
      console.log('접속해제시 유저', socket.user);

      if (!socket.user) {
        return console.log('유저가 없음');
      }

      delete clients[socket.user.userId]; // 접속해제시, clients정보 지우기
      console.log(clients);

      const now = new Date();
      await usersRepository.updateLastloginUser(socket.user.userId, now);

      clearInterval(interval);
    });
  });
};

export default WebSocket;
