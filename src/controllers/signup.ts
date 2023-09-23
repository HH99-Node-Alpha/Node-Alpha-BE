import { Request, Response } from 'express';
import asyncHandler from '../lib/asyncHandler';
import SignupService from '../services/signup';
import { CustomError } from '../errors/customError';


class SignupController {
    constructor( private readonly signupService: SignupService) {}

    signupUser = asyncHandler( async (req: Request, res: Response) => {
        const { email, name, password, confirm } = req.body;

        if (!email || !name || !password || !confirm) {
            throw new CustomError(400, '요청한 데이터 형식이 올바르지 않습니다.') //return { status: 400, message: '요청한 데이터 형식이 올바르지 않습니다.' };
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
            throw new CustomError(412, '이메일 형식이 일치하지 않습니다.') //return { status: 412, message: '이메일 형식이 일치하지 않습니다.' };
        }

        if (password.length < 4 || password.includes(name)) {
            throw new CustomError(412, '패스워드 형식이 일치하지 않습니다.')//return { status: 412, message: '패스워드 형식이 일치하지 않습니다.' };
        }

        if (password !== confirm) {
            throw new CustomError(412, '패스워드가 일치하지 않습니다.') //return { status: 412, message: '패스워드가 일치하지 않습니다.' };
        }

        const user = await this.signupService.signupUser(email, name, password, confirm);
        res.status(200).json({ message: '회원가입에 성공했습니다.' });
  });       
}

export default SignupController;