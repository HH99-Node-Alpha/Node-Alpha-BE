import express, { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma/index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
/** 사용자 로그인 API 
1. `email`, `password`를 **body**로 전달받습니다.
2. 전달 받은 `email`에 해당하는 사용자가 있는지 확인합니다.
3. 전달 받은 `password`와 데이터베이스의 저장된 `password`를 bcrypt를 이용해 검증합니다.
4. 로그인에 성공한다면, 사용자에게 JWT와 name을 발급합니다.
*/
router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.users.findFirst({
        where: { email },
      });
      // 사용자가 있는지 확인합니다.
      if (!user) {
        return res.status(412).json({ message: '이메일을 확인해주세요.' });
      }
      // bcrypt를 이용해 패스워드를 검증합니다.
      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(412).json({ message: '비밀번호를 확인해주세요.' });
      }

      // 로그인에 성공하면, 사용자의 userId를 바탕으로 JWT 토큰을 발급합니다.
      const token = jwt.sign(
        {
          userId: user.userId,
        },
        process.env.SECRET_KEY as string, // 비밀키를 입력
        { expiresIn: '30d' },
      );

      // Authorization 쿠키에 Bearer 토큰 형식으로 JWT를 저장합니다.
      res.cookie('Authorization', `Bearer ${token}`);

      // 로그인 성공시 JWT와 name을 응답합니다.
      const response = {
        token,
        name: user.name,
      };

      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },
);

/** 사용자 로그아웃 API 
 * JWT인증을 사용해서 로그아웃은 Authorization 쿠키를 제거하는 것으로 구현
*/
router.get(
  '/logout',
  async (req: Request, res: Response, next: NextFunction) => {
    // Authorization 쿠키를 제거합니다.
    res.clearCookie('Authorization');
    return res.status(200).json({ message: '로그아웃에 성공했습니다.' });
  },
);

export default router;
