import { Request } from 'express';
import LoginRepository from '../repositories/login';
import { CustomError } from '../errors/customError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class LoginService {
    constructor(
        private readonly loginRepository: LoginRepository) {}

    login = async (email: string, password: string, req: Request) => {
        //이메일 존재여부 확인
        const user = await this.loginRepository.findUserByEmail(email);
        if (!user) {
            throw new CustomError(409, '존재하지 않는 이메일입니다.') 
        }

        //비밀번호 일치여부 확인
        if (!await bcrypt.compare(password, user.password)) {
            throw new CustomError(409, '비밀번호가 일치하지 않습니다.')
        }

        // JWT 토큰 발급
        const accessToken = await jwt.sign(
            { 
                userId: user.userId 
            }, 
            process.env.ACCESS_SECRET_KEY!, 
            { expiresIn: '1h' }
            );

        const refreshToken = await jwt.sign(
            {
                userId: user.userId,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            },
            process.env.REFRESH_SECRET_KEY!,
            { expiresIn: '1d' }
        );

        // Refresh Token을 데이터베이스에 저장합니다.
        await this.loginRepository.saveRefreshToken(user.userId, refreshToken);

        return {
            accessToken,
            refreshToken,
            userId: user.userId,
            name: user.name,
        };
    }
}

export default LoginService;