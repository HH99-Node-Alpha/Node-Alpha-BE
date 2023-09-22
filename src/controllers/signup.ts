import { Request, Response } from 'express';
import asyncHandler from '../lib/asyncHandler';
import SignupService from '../services/signup';


class SignupController {
    constructor( private readonly signupService: SignupService) {}

    signupUser = asyncHandler( async (req: Request, res: Response) => {
        const { email, name, password, confirm } = req.body;
        const user = await this.signupService.signupUser(email, name, password, confirm);
        res.status(200).json({ message: '회원가입에 성공했습니다.' });
  });       
}

export default SignupController;