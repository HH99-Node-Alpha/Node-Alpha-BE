import passport from "passport";
import { Strategy as KaKaoStrategy } from "passport-kakao";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";

export default () => {
  passport.use(
    new KaKaoStrategy(
      {
        clientID: process.env.KAKAO_ID!,
        callbackURL: `http://localhost:8000/api/kakao/callback`,
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