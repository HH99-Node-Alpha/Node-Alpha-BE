import SignupRepository from '../repositories/signup';
import WorkspacesRepository from '../repositories/workspace';
import { CustomError } from '../errors/customError';


class SignupService {
    constructor(
        private readonly signupRepository: SignupRepository,
        private readonly workspacesRepository: WorkspacesRepository) {}
    
    signupUser = async (email: string, name: string, password: string, confirm: string) => {
        
        //이메일 중복 체크
        const existingUser = await this.signupRepository.findUserByEmail(email);
        if (existingUser) {
            throw new CustomError(409, '중복된 이메일입니다.') //return { status: 409, message: '중복된 이메일입니다.' };
        }

        //회원가입
        const user = await this.signupRepository.signupUser(email, name, password, confirm);

        // 회원가입시 워크스페이스 생성
        await this.workspacesRepository.createWorkspace(name, user.userId);

        return user;
    }
}

export default SignupService;