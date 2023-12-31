import express from 'express';
import SignupController from '../controllers/signup';
import SignupRepository from '../repositories/signup';
import SignupService from '../services/signup';
import WorkspacesRepository from '../repositories/workspace';
import BoardsRepository from '../repositories/boards';
import UsersRepository from '../repositories/users';

const router = express.Router();
const signupRepository = new SignupRepository();
const usersRepository = new UsersRepository();
const boardsRepository = new BoardsRepository(usersRepository);
const workspacesRepository = new WorkspacesRepository(boardsRepository); //여기 연결 어떻게 하는지
const signupService = new SignupService(signupRepository, workspacesRepository);
const signupController = new SignupController(signupService);

router.post('/signup', signupController.signupUser);

export default router;

/** 분리하기 전에 코드 */
// import express, { Request, Response, NextFunction } from 'express';
// import prisma from '../utils/prisma/index';
// import bcrypt from 'bcrypt'; // 비밀번호 암호화

// const router = express.Router();

// interface SignupRequest {
//   email: string;
//   name: string;
//   password: string;
//   confirm: string;
// }

// // class SignupRequest {
// //     email: string;
// //     name: string;
// //     password: string;
// // } // 종훈님이 알려주신다고 하셨어요 - 푸름매니저님

// router.post(
//   '/signup',
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       console.log('req.body', req.body);
//       const { email, name, password, confirm } = req.body as SignupRequest;

//       if (!email || !name || !password || !confirm) {
//         return res
//           .status(400)
//           .send({ message: '요청한 데이터 형식이 올바르지 않습니다.' });
//       }

//       const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//       if (!emailRegex.test(email)) {
//         return res
//           .status(412)
//           .json({ message: '이메일 형식이 일치하지 않습니다.' });
//       }

//       if (password.length < 4 || password.includes(name)) {
//         return res
//           .status(412)
//           .json({ message: '패스워드 형식이 일치하지 않습니다.' });
//       }

//       if (password !== confirm) {
//         return res
//           .status(412)
//           .json({ message: '패스워드가 일치하지 않습니다.' });
//       }

//       const existingUser = await prisma.users.findUnique({
//         where: { email },
//       });
//       if (existingUser) {
//         return res.status(409).json({ message: '중복된 이메일입니다.' });
//       }

//       const hashedPassword = await bcrypt.hash(password, 10);

//       const user = await prisma.users.create({
//         data: {
//           email,
//           name,
//           password: hashedPassword,
//         },
//       });

//       // controller, service, repository로 나눠서 바꾸기
//       // await workspacesRepository.createWorkspace( user.name, user.userId,);

//       return res.status(201).json({ message: '회원가입에 성공하였습니다.' });
//     } catch (err) {
//       next(err);
//     }
//   },
// );

// export default router;
