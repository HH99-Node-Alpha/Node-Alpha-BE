import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { Application } from 'express';

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

  // step0: socket 기본 연결
  board.on('connection', (socket) => {
    console.log('board에 접속한 socket.id:', socket.id);
    // console.log(socket.request.headers);
    socket.on('disconnect', () => {
      console.log('board 접속해제', socket.id);
      clearInterval(interval);
    });

    socket.on('error', (error) => {
      console.error(error);
    });

    // step1: 'join'을 통해서, 'boardId'에 입장 (by boardId)
    socket.on('join', (boardId) => {
      // (1)방에 참가(join)
      socket.join(boardId); // 전달받은 boardRoomId에 접속
      console.log('현재 접속중인 socket.id와 boardRoom번호:', socket.rooms);
      // (1-2)본인 접속 메세지
      socket.emit('join', {
        message: `(본인)${socket.id}님은 ${boardId}번 board에 입장했습니다`,
      });
      // (1-3)다른 사람 들어온 걸 알게 해줌 -> to(boardId): 입장한 본인 제외 모든 boardId에 있는 사람들에게
      socket.to(boardId).emit('join', {
        message: `(타인)${socket.id}님이 ${boardId}번 board에 입장했습니다`,
      });

      // (2)칼럼 순서 변경 - 실시간 통신 -> /controllers/columns.ts의 updated쪽에서 처리

      // Todo
      // (2-2)카드 순서 변경
      // (3)그냥 떠나는게 아니라, 다른 방 이동이면 leave -> if문으로 join or disconnect
      // (x)방 나가기
      // socket.leave(boardId);
    });
  });
};

export default WebSocket;

// 백업용 - 메세지 확인용
// socket.on('columnToServer', async (data: any) => {
//   socket.emit('columnToClient', '본인이 순서 변경');
//   socket.to(boardId).emit('columnToClient', '타인이 순서 변경');
// socket.to(boardId).emit('updateColumnOrder', data);
// or
// setInterval(() => {
//   socket.emit('columnToClient', '순서 변경 성공');
// }, interval);
// });
