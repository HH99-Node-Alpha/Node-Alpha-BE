import prisma from '../utils/prisma/index';
import bcrypt from 'bcrypt'; // 비밀번호 암호화

class SignupRepository {
    // constructor(private readonly prisma: prisma) {} // 이게 없으니까 동작해서 지웠는데 잘 모르겠어요. 
    findUserByEmail = async (email: string) => {
        return await prisma.users.findUnique({ where : { email } });
    }

    signupUser = async (email: string, name: string, password: string, confirm: string) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await prisma.users.create({
            data: {
                email: email,
                name: name,
                password: hashedPassword,
            },
        });
        return result;
    }
}
export default SignupRepository;