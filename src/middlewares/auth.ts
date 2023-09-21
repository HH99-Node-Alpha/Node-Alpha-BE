import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

interface DecodedToken {
  userId: string;
  // 이곳에 토큰에 추가로 저장된 필드가 있다면 추가할 수 있습니다.
}

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { Authorization } = req.cookies;
    if (!Authorization) throw new Error('토큰이 존재하지 않습니다.');

    const [tokenType, token] = Authorization.split(' ');
    if (tokenType !== 'Bearer')
      throw new Error('토큰 타입이 일치하지 않습니다.');

    // const decodedToken = jwt.verify(token, process.env.SECRET_KEY) as DecodedToken;
    // const userId = decodedToken.userId;
    // if (!process.env.SECRET_KEY) throw new Error('SECRET_KEY가 존재하지 않습니다.'); // 이 부분을 해주면 환경변수설정해준 거라 SECRET_KEY가 없다고 뜨지 않음
    const decodedToken: unknown = jwt.verify(
      token,
      process.env.ACCESS_SECRET_KEY!,
    ); // 이거는 무조건 있다고 명시하는게 ! 이거임 효율적이라 더 많이 씀
    if (typeof decodedToken !== 'object' || decodedToken === null) {
      throw new Error('토큰 형식이 올바르지 않습니다.');
    }

    const userId = (decodedToken as DecodedToken).userId;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) {
      res.clearCookie('Authorization');
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    req.user = user;
    next();
  } catch (error: any) {
    // accessToken 쿠키를 삭제합니다.
    res.clearCookie('Authorization');

    switch (error.message) {
      case 'TokenExpiredError':
        return res.status(401).json({ message: '토큰이 만료되었습니다.' });
      case 'JsonWebTokenError':
        return res.status(401).json({ message: '토큰이 조작되었습니다.' });
      default:
        return res
          .status(401)
          .json({ message: error.message ?? '비정상적인 요청입니다.' });
    }
  }
}
