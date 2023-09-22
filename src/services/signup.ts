import SignupRepository from '../repositories/signup';
import WorkspacesRepository from '../repositories/workspace';

class SignupService {
    constructor(
        private readonly signupRepository: SignupRepository,
        private readonly workspacesRepository: WorkspacesRepository) {}
    
    signupUser = async (email: string, name: string, password: string, confirm: string) => {
        if (!email || !name || !password || !confirm) {
            return { status: 400, message: '요청한 데이터 형식이 올바르지 않습니다.' };
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
            return { status: 412, message: '이메일 형식이 일치하지 않습니다.' };
        }

        if (password.length < 4 || password.includes(name)) {
            return { status: 412, message: '패스워드 형식이 일치하지 않습니다.' };
        }

        if (password !== confirm) {
            return { status: 412, message: '패스워드가 일치하지 않습니다.' };
        }

        const existingUser = await this.signupRepository.findUserByEmail(email);
        if (existingUser) {
            return { status: 409, message: '중복된 이메일입니다.' };
        }

        const user = await this.signupRepository.signupUser(email, name, password, confirm);

        await this.workspacesRepository.createWorkspace(name, user.userId);

        return user;
    }
}

export default SignupService;