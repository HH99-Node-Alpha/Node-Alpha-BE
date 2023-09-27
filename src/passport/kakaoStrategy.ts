import passport from "passport";
import { Strategy as KaKaoStrategy } from "passport-kakao";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import WorkspacesRepository from '../repositories/workspace';
import BoardsRepository from "../repositories/boards";
import UsersRepository from "../repositories/users";


export default () => {
  passport.use(
    new KaKaoStrategy(
      {
        clientID: process.env.KAKAO_ID!,
        callbackURL: `${process.env.SERVER_URL}/api/kakao/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('profile', profile);
        try {
            //로그인
          const existUser = await prisma.users.findUnique({
            where: {
              snsId_provider: { snsId: String(profile.id), provider: "kakao" },
            },
          });
          if (existUser) {
            done(null, existUser);
          } else {
            //회원가입
            const newUser = await prisma.users.create({
              data: {
                email: profile._json?.kakao_account?.email,
                name: profile.displayName,
                snsId: String(profile.id),
                provider: "kakao",
              },
            });

            const workspaceName = newUser.name;
            const ownerId = newUser.userId;

            const usersRepository = new UsersRepository();
            const boardsRepository = new BoardsRepository(usersRepository);
            const workspacesRepository = new WorkspacesRepository(boardsRepository);

            const workspace = await workspacesRepository.createWorkspace(workspaceName, ownerId);

            // 회원가입과 동시에 워크스페이스 생성
            // const workspace = await prisma.workspaces.create({
            //   data: {
            //     workspaceName,
            //     ownerId,
            //     WorkspacesMembers: {
            //       create: {
            //         UserId: ownerId,
            //       },
            //     },
            //   },
            // });

            // // 워크스페이스에 연결된 보드 확인
            // const existingBoards = await prisma.boards.findMany({
            //   where: {
            //     WorkspaceId: workspace.workspaceId,
            //   },
            // });
        
            // if (existingBoards.length === 0) {
            //   // 워크스페이스에 연결된 보드가 없을 경우
            //   const user = await prisma.users.findUnique({
            //     where: { userId: ownerId },
            //   });

            // if (user) {
            //   const boardName = `${user.name}의 Board`;
            //   await prisma.boards.create({
            //     data: {
            //       boardName,
            //       WorkspaceId: workspace.workspaceId,
            //       colorId: 3,
            //     },
            //   });
            // }
          //  return workspace;

            done(null, newUser);
          
        }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};