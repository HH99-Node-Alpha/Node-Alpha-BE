import prisma from '../utils/prisma/index';


class LoginRepository {
    findUserByEmail = async (email: string) => {
        return await prisma.users.findUnique({ where : { email } });
    }

    saveRefreshToken = async (userId: number, refreshToken: string) => {
        return await prisma.users.update({
            where: { userId},
            data: {
                refreshToken: refreshToken,
            },
        });
    }

    findUserByRefreshToken = async (userId: number, refreshToken: string) => {
        return await prisma.users.findUnique({
            where: { userId },
            select: { refreshToken: true },
        })
    }
}

export default LoginRepository;