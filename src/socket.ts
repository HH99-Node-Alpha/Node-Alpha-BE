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
      console.log('현재 접속중인 socket.id와 boardRoom번호:', socket.rooms);
      socket.emit('join', {
        message: `(본인)${socket.id}님은 ${boardId}번 board에 입장했습니다`,
      });
      socket.to(boardId).emit('join', {
        message: `(타인)${socket.id}님이 ${boardId}번 board에 입장했습니다`,
      });

      // 1-1.칼럼 추가
      socket.on('addToServer', async (data: any) => {
        console.log(data);
        socket.emit('addToClient', '본인이 추가'); // *두번 들어가는 경우도 있대 확인하기
        socket.to(boardId).emit('addToClient', '타인이 추가'); // 체크용
      });

      // 1-2.칼럼 수정
      socket.on('changeToServer', async (data: any) => {
        console.log(data);
        socket.emit('changeToClient', '본인이 순서 변경'); // 체크용
        socket.to(boardId).emit('changeToClient', '타인이 순서 변경'); // 체크용
      });

      // 1-3.칼럼 삭제
      socket.on('deleteToServer', async (data: any) => {
        console.log(data);
        socket.emit('deleteToClient', '본인이 삭제'); // 체크용
        socket.to(boardId).emit('deleteToClient', '타인이 삭제'); // 체크용
      });
    });
  });

  /** 2. event - 초대 */
  event.on('connection', (socket: any) => {
    console.log('event접속:', socket.id);
    // console.log('여기서:', socket.handshake.query.userId);
    // const loginUser = socket.handshake.query.userId;
    // console.log('로그인 유저', loginUser);

    socket.on('error', (error: any) => {
      console.error(error);
    });

    // A. loginAndAlarm
    // main접속 -> (1)가장 최근 로그인 기록이 나오고 & (2)접속끊은 이후에 온 초대 메세지 확인
    socket.on('loginAndAlarm', async (data: any) => {
      const user = await usersRepository.getUser(data);
      socket.user = user; // lastLogin담을 용도
      const loginLog = user?.lastLogin || null;
      const userName = user?.name;
      const invitations = await usersRepository.getInvitations(data);

      let inviteResult: any = '';
      // 1)초대목록이 없는 경우
      if (!invitations.length) {
        inviteResult = '초대받은 알람이 없습니다';
        socket.emit('loginAndAlarm', { loginLog, inviteResult });
      }
      // 2)초대목록이 있다면
      else {
        const workspaceId = invitations[0].WorkspaceId;
        const workspaceName =
          await usersRepository.getWorkspaceName(workspaceId);
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
        socket.emit('loginAndAlarm', {
          loginLog,
          inviteResult,
          userName,
          workspaceName,
        });
      }
    });

    // B. 초대 알람
    socket.on('invite', async (inviteInfo: any) => {
      const Invitation = await usersRepository.createInvitations(
        inviteInfo.workspaceId,
        inviteInfo.invitedUserId, // 초대한 사람
        inviteInfo.invitedByUserId, // 초대 받은 사람
      );

      // *worksacpes.repositories만들어지면 DI로 리팩토링
      const workspace = await prisma.workspaces.findUnique({
        where: { workspaceId: inviteInfo.workspaceId },
      });

      const workspaceName = workspace?.workspaceName;
      inviteInfo['workspaceName'] = workspaceName;
      inviteInfo['invitationId'] = Invitation.invitationId;

      socket.emit('invite', inviteInfo);
    });

    // C. 초대 승낙/거절 - user Router에서 마무리
    socket.on('confirmInvitation', async (data: any) => {
      if (data.accepted) {
        await usersRepository.createWorkspaceMember(
          data.workspaceId,
          data.InvitedByUserId, // userId를 위에서 만든 loginUser로 대체
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

    socket.on('disconnect', async () => {
      console.log('event접속해제: ', socket.id);
      console.log('접속해제시 유저', socket.user);
      const now = new Date();
      await usersRepository.updateLastloginUser(socket.user.userId, now);
      clearInterval(interval);
    });
  });
};

export default WebSocket;

// const loginUser = socket.handshake.query.userId;
// console.log('로그아웃시 잘 찍히냐:', loginUser);

// [ Not yet ]
// (2-2)카드 순서 변경 -> /controllers/cards.ts에 추가
// socket.on('cardToServer', async (data: any) => {
//   console.log(data);
//   socket.emit('cardToClient', '본인이 순서 변경');
//   socket.to(boardId).emit('cardToClient', '타인이 순서 변경');
// });
// (3)그냥 떠나는게 아니라, 다른 방 이동이면 leave -> if문으로 join or disconnect
// (x)방 나가기
// socket.leave(boardId);
