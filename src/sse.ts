import SSE from 'express-sse-ts';
import express from 'express';

const app = express();
const sse = new SSE();

// sse: '/sse'는 client에 보낼 이벤트명
// https://github.com/dubbelster/express-sse-ts 참조
app.get('/sse', sse.init);

let cnt = 0;
setInterval(() => {
  // Sends message to all connected clients
  sse.send(`Message #${cnt++}`);

  // All options for sending a message
  sse.send(
    'data: string',
    'eventName?: string',
    'id?: string | number | undefined',
  );
}, 2000);

// ----------------------
// client's 코드
// const display = document.getElementById('display');
// const es = new EventSource('/events'); // Create EventSource

// // Listen to event with name 'message'
// es.onmessage = event => {
//     // Do something width event.
// }

// // Listen to event with name 'eventName'
// es.addEventListener('eventName', event => {
//     // Do something width event.
// });
