import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { Application } from 'express';
import prisma from './utils/prisma';

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
  const event = io.of('/main'); // '워크스페이스'초대용

  /** 1. board접속 및 컬럼 순서 변경 */
  board.on('connection', (socket) => {
    // console.log(socket.request.headers);
    console.log('board접속:', socket.id);
    socket.on('disconnect', () => {
      console.log('board접속해제', socket.id);
      clearInterval(interval);
    });

    socket.on('error', (error) => {
      console.error(error);
    });

    socket.on('join', (boardId) => {
      socket.join(boardId); // 전달받은 boardRoomId에 접속
      console.log('현재 접속중인 socket.id와 boardRoom번호:', socket.rooms);
      socket.emit('join', {
        message: `(본인)${socket.id}님은 ${boardId}번 board에 입장했습니다`,
      });
      socket.to(boardId).emit('join', {
        message: `(타인)${socket.id}님이 ${boardId}번 board에 입장했습니다`,
      });

      // 칼럼 순서 변경 - 실시간 공지 -> /controllers/columns.ts의 updated에서 처리
      socket.on('columnToServer', async (data: any) => {
        console.log(data);
        socket.emit('columnToClient', '본인이 순서 변경');
        socket.to(boardId).emit('columnToClient', '타인이 순서 변경');
      });
    });
  });

  /** 2. event - 초대 */
  event.on('connection', (socket) => {
    console.log('event접속:', socket.id);

    socket.on('error', (error) => {
      console.error(error);
    });

    // main접속 -> (1)가장 최근 로그인 기록이 나오고 & (2)접속끊은 이후에 온 초대 메세지 확인
    socket.on('loginAndAlarm', async (userId) => {
      const user = await prisma.users.findUnique({
        where: { userId },
      });
      const loginLog = user?.lastLogin || null;
      const invitations: any = await prisma.invitations.findMany({
        where: { InvitedByUserId: userId },
      });

      let inviteResult: any = '';
      // 1-초대목록이 없는 경우
      if (!invitations) {
        inviteResult = '초대받은 알람이 없습니다';
        socket.emit('loginAndAlarm', { loginLog, inviteResult });
      }
      // 2-초대목록이 있다면
      else {
        // 2-1: 접속한 적이 있으면
        if (loginLog) {
          inviteResult = invitations.filter(
            (invitation: any) =>
              new Date(invitation.createdAt) > new Date(loginLog),
          );
          // 2-2: 최초 접속(회원가입만 하고, 접속x경우 -> loginLog가 없음)
        } else {
          inviteResult = invitations;
        }
        socket.emit('loginAndAlarm', { loginLog, inviteResult });
      }
    });

    let loginUser: number = 0; // lastLogin업데이트 용 userId - 아래 disconnect에서 사용
    socket.on('invite', async (inviteInfo: any) => {
      loginUser = inviteInfo.invitedByUserId;

      await prisma.invitations.create({
        data: {
          WorkspaceId: inviteInfo.WorkspaceId,
          InvitedUserId: inviteInfo.InvitedUserId, // 초대한 사람
          InvitedByUserId: inviteInfo.InvitedByUserId, // 초대 받은 사람
        },
      });

      const workspace = await prisma.workspaces.findUnique({
        where: { workspaceId: inviteInfo.WorkspaceId },
      });

      const workspaceName = workspace?.workspaceName;
      inviteInfo['WorkspaceName'] = workspaceName; // 객체에 name 추가

      io.to(socket.id).emit('invite', inviteInfo);
    });

    socket.on('disconnect', () => {
      console.log('event접속해제: ', socket.id);
      console.log(loginUser); // 변경되는지 확인 - 안되면, socket.leave(userId) etc..(with join)
      // 로그아웃 시간 저장
      prisma.users.update({
        where: { userId: loginUser },
        data: { lastLogin: new Date() },
      });
      clearInterval(interval);
    });
  });
};

export default WebSocket;

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
