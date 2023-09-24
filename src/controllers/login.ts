import { Request, Response } from 'express';
import asyncHandler from '../lib/asyncHandler';
import LoginService from '../services/login';
import { CustomError } from '../errors/customError';


type CookieOptions = {
    httpOnly: boolean;
    sameSite: 'none' | 'lax' | 'strict' | undefined;
    secure: boolean;
  }
  
  const cookieOptions:CookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  }


class LoginController {
    constructor( private readonly loginService: LoginService) {}

    login = asyncHandler( async (req: Request, res: Response) => {
        const { email, password } = req.body;
    
        if (!email || !password) {
            throw new CustomError(400, '요청한 데이터 형식이 올바르지 않습니다.') 
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
            throw new CustomError(412, '이메일 형식이 일치하지 않습니다.')
        }

        if (password.length < 4) {
            throw new CustomError(412, '패스워드 형식이 일치하지 않습니다.')
        }

        const user = await this.loginService.login(email, password, req);

        res.cookie('Authorization', `Bearer ${user.accessToken}`, cookieOptions);
        res.cookie('refreshToken', user.refreshToken, cookieOptions);

        res.status(200).json({ data: {userId: user.userId, username: user.name} });
    });
}

export default LoginController;