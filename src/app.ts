import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import session from 'express-session';
import { config } from 'dotenv';
import cors from 'cors';
import passport from 'passport';

import mainRouter from './routes/index';

import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';

config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();

app.set('port', process.env.PORT || 8000);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

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

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 실행');
});
