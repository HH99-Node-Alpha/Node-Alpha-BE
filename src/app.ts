import express, { Request, Response } from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import session from 'express-session';
import { config } from 'dotenv';
import cors from 'cors';
import passport from 'passport';

import WebSocket from './socket';
import LogMiddleware from './middlewares/log';

import mainRouter from './routes/index';

import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';
import passportConfig from './passport';

config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const server = http.createServer(app);

passportConfig();

app.set('port', process.env.PORT || 8000);
app.use(LogMiddleware);
let allowedOrigins = [process.env.CLIENT_URL];

if (process.env.NODE_ENV === 'production') {
  allowedOrigins = [process.env.CLIENT_PROD_URL];
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public'))); // 퍼블릭폴더를 프론트에서 접근 가능하게 함.
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // form 요청 받는 설정
app.use(cookieParser(process.env.COOKIE_SECRET)); // { connect.sid : 123144359}
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// router
app.use('/api', mainRouter);

// 404 미들웨어
app.use(notFound);

// 에러 처리 핸들러 미들웨어
if (process.env.NODE_ENV === 'production') {
  app.use((err: any, req: Request, res: Response) => {
    res.status(err.status || 500).send('Something went wrong!');
  });
} else {
  app.use(errorHandler);
}

server.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 실행');
});

WebSocket(server, app);
