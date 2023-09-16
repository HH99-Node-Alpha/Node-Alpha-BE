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

  io.on('connection', (socket) => {
    console.log('new client connected: ', socket.id);

    socket.on('disconnect', () => {
      console.log('new client disconnected', socket.id);
      clearInterval(interval);
    });

    socket.on('error', (error) => {
      console.error(error);
    });

    socket.on('toServer', (data: any) => {
      console.log(data); // 클라이언트 -> 서버
    });

    setInterval(() => {
      socket.emit('toClient', '서버 -> 클라이언트'); // 서버 -> 클라이언트
    }, interval);
  });
};

export default WebSocket;

// const workspace = io.of('/workspace');

// workspace.on('connection', (socket) => {
//   console.log('workspace 네임스페이스 접속');

//   socket.on('disconnect', () => {
//     console.log('workspace 네임스페이스 접속 해제');
//   });

//   socket.on('error', (error) => {
//     console.error(error);
//   });
// });
