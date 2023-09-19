import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { Application } from 'express';
import prisma from './utils/prisma/index';

const interval: number = 3000;

const WebSocket = (server: HttpServer, app: Application) => {
  const io = new SocketServer(server, {
    path: '/socket.io',
    cors: {
      origin: '*',
    },
  });

  app.set('io', io);
  const board = io.of('/');

  // const boardRoom = io.of(`/${boardId}`);

  board.on('connection', (socket) => {
    // const req = socket.request;
    const { referer } = socket.request.headers; // 브라우저 주소가 들어있음
    console.log(referer); // 체크용
    console.log('board 접속: ', socket.id);

    // const boardId = 0;
    // socket.on('join', (data) => {
    //   socket.join(data);
    //   console.log(data);
    // });

    // console.log(boardId);

    socket.on('disconnect', () => {
      console.log('board 접속해제', socket.id);
      clearInterval(interval);
    });

    socket.on('error', (error) => {
      console.error(error);
    });

    let flag: number = 0;
    let result: any = '';
    /** 1. columnOrder */
    // 클라이언트 -> 서버
    socket.on('ColumnToServer', async (data: any) => {
      console.log(data);

      const { columnId, columnOrder } = data;
      const changeColumnOrder = await prisma.columns.update({
        where: { columnId },
        data: { columnOrder },
      });

      console.log(changeColumnOrder);
      flag = 1;
      result = changeColumnOrder;
    });

    // result가 바뀌면: 서버 -> 클라이언트 ( db에 저장된 변경값을 다시 보내주기 )
    if (flag === 1) {
      setInterval(() => {
        socket.emit('ColumnToClient', result);
      }, interval);
      flag = 0;
    }

    /** 2. cardOrder */
    // 클라이언트 -> 서버
    socket.on('CardToServer', async (data: any) => {
      const { cardId, cardOrder } = data;
      const changecardOrder = await prisma.cards.update({
        where: { cardId },
        data: { cardOrder },
      });

      console.log(changecardOrder);
      result = changecardOrder;
      flag = 2;
    });

    // 서버 -> 클라이언트 ( db에 저장된 변경값을 다시 보내주기 )
    if (flag === 2) {
      setInterval(() => {
        socket.emit('CardToClient', result);
      }, interval);
      flag = 0;
    }
  });
};

export default WebSocket;
