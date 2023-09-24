import express from 'express';
import authMiddleware from '../middlewares/auth';
import LoginController from '../controllers/login';
import LoginRepository from '../repositories/login';
import LoginService from '../services/login';


const router = express.Router();

const loginRepository = new LoginRepository();//여기 연결 어떻게 하는지
const loginService = new LoginService(loginRepository);
const loginController = new LoginController(loginService);

router.post('/login', loginController.login);
// router.post('/token', authMiddleware, loginController.verifyToken);
// router.post('/refresh', loginController.refreshToken);
// router.post('/logout', authMiddleware, loginController.logout);

export default router; 

// import express, { Request, Response, NextFunction } from 'express';
// import { LoginRequest } from '../types/login';
// import prisma from '../utils/prisma/index';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import authMiddleware from '../middlewares/auth';

// const router = express.Router();

// /** 사용자 로그인 API 
// 1. `email`, `password`를 **body**로 전달받습니다.
// 2. 전달 받은 `email`에 해당하는 사용자가 있는지 확인합니다.
// 3. 전달 받은 `password`와 데이터베이스의 저장된 `password`를 bcrypt를 이용해 검증합니다.
// 4. 로그인에 성공한다면, 사용자에게 JWT와 name을 발급합니다.
// */

// type CookieOptions = {
//   httpOnly: boolean;
//   sameSite: 'none' | 'lax' | 'strict' | undefined;
//   secure: boolean;
// }

// const cookieOptions:CookieOptions = {
//   httpOnly: true,
//   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//   secure: process.env.NODE_ENV === 'production',
// }

// router.post(
//   '/login',
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { email, password } = req.body as LoginRequest;
//     try {
//       const user = await prisma.users.findFirst({
//         where: { email },
//       });
//       // 사용자가 있는지 확인합니다.
//       if (!user) {
//         return res.status(412).json({ message: '이메일을 확인해주세요.' });
//       }
//       if (!email || !password) {
//         return res
//           .status(400)
//           .json({ message: '이메일과 비밀번호를 작성해주세요.' });
//       }
//       // bcrypt를 이용해 패스워드를 검증합니다.
//       if (!(await bcrypt.compare(password, user.password))) {
//         return res.status(412).json({ message: '비밀번호를 확인해주세요.' });
//       }

//       // JWT를 발급합니다.
//       const accessToken = await jwt.sign(
//         {
//           userId: user.userId,
//         },
//         process.env.ACCESS_SECRET_KEY!,
//         { expiresIn: '1h' },
//       );
//       const refreshToken = await jwt.sign(
//         {
//           userId: user.userId,
//           ip: req.ip,
//           userAgent: req.headers['user-agent'],
//         },
//         process.env.REFRESH_SECRET_KEY!,
//         { expiresIn: '1d' },
//       );

//       // Access, Refresh Token을 HttpOnly Cookie에 저장합니다.
//       // 보안을 강화하기 위한 중요한 옵션, https로 배포시 secure: true로 설정
//       res.cookie('Authorization', `Bearer ${accessToken}`, cookieOptions)

//       res.cookie('refreshToken', refreshToken, cookieOptions);

//       // Refresh Token을 데이터베이스에 저장합니다.
//       await prisma.users.update({
//         where: { userId: user.userId },
//         data: {
//           refreshToken: refreshToken,
//         },
//       });

//       return res.status(200).json({ data: {userId: user.userId, username: user.name} });
//     } catch (err) {
//       next(err);
//     }
//   },
// );

// /** Accsess Token 인증 API */
// router.post(
//   '/token',
//   authMiddleware,
//   async (req: Request, res: Response, next: NextFunction) => {
//     // try {
//     //   const { Authorization } = req.cookies;

//     //   if (!Authorization) {
//     //     return res
//     //       .status(401)
//     //       .json({ message: '엑세스 토큰이 존재하지 않습니다.' });
//     //   }

//     //   //Access Token이 서버가 발급한 것이 맞는지 검증합니다.
//     //   const { userId } = (await jwt.verify(
//     //     Authorization,
//     //     process.env.ACCESS_SECRET_KEY!,
//     //   )) as { userId: number };

//     //   const user = await prisma.users.findUnique({
//     //     where: {
//     //       userId: +userId,
//     //     },
//     //   });

//     //   if (!user) {
//     //     res.clearCookie('Authorization');

//     //     return res.status(404).json({
//     //       message: '해당하는 사용자를 찾을 수 없습니다.',
//     //     });
//     //   }

//     return res
//       .status(200)
//       .json({ message: '엑세스 토큰 인증에 성공하였습니다.' });
//     //   } catch (err) {
//     //     // accessToken 쿠키를 삭제합니다.
//     //     res.clearCookie('Authorization');

//     //     console.error(err);
//     //     return res.status(400).json({
//     //       message: '엑세스 토큰 인증에 실패하였습니다.',
//     //     });
//     //   }
//   },
// );

// /** Access Token 재발급 API */
// router.post(
//   '/refresh',
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { refreshToken } = req.cookies;

//       if (!refreshToken) {
//         return res
//           .status(401)
//           .json({ message: '리프레시 토큰이 존재하지 않습니다.' });
//       }

//       // Refresh Token이 서버가 발급한 것이 맞는지 검증합니다.
//       // const { userId } = jwt.verify(
//       //   refreshToken,
//       //   process.env.REFRESH_SECRET_KEY!,
//       // )

//       const decodedToken = jwt.verify(
//         refreshToken,
//         process.env.REFRESH_SECRET_KEY!,
//       );
//       if (typeof decodedToken !== 'object' || decodedToken === null) {
//         throw new Error('토큰 형식이 올바르지 않습니다.');
//       }

//       const userId = decodedToken.userId;

//       const user = await prisma.users.findUnique({
//         where: { userId: +userId },
//         select: { refreshToken: true },
//       });

//       // 사용자가 존재하지 않거나, RefreshToken이 일치하지 않으면 에러를 발생시킵니다.
//       if (!user || refreshToken !== user.refreshToken) {
//         res.clearCookie('Authorization');
//         res.clearCookie('refreshToken');

//         return res
//           .status(401)
//           .json({ message: '리프레시 토큰 인증에 실패하였습니다.' });
//       }

//       // Access Token을 새롭게 생성한 후, 사용자 쿠키에 설정해줍니다.
//       const newAccessToken = jwt.sign(
//         { userId: userId },
//         process.env.ACCESS_SECRET_KEY!,
//         {
//           expiresIn: '1h',
//         },
//       );
//       res.cookie('Authorizaion', newAccessToken, cookieOptions);

//       return res
//         .status(200)
//         .json({ newAccessToken });
//     } catch (err) {
//       res.clearCookie('Authorization');
//       res.clearCookie('refreshToken');

//       console.error(err);
//       return res
//         .status(400)
//         .json({ message: '리프레시 토큰 검증에 실패하였습니다.' });
//     }
//   },
// );

// /** 사용자 로그아웃 API */
// router.post('/logout', authMiddleware, (req: Request, res: Response) => {
//   // 쿠키에서 accessToken과 refreshToken을 제거
//   res.clearCookie('Authorization');
//   res.clearCookie('refreshToken');
//   return res
//     .status(200)
//     .json({ message: '현재 로그아웃 상태 또는 세션이 만료되었습니다.' });
// });

// export default router;
