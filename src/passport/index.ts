import passport from "passport";
import kakao from "./kakaoStrategy";
import prisma from "../utils/prisma/index";

const passportConfig = () => {
  passport.serializeUser((user, done) => {
    done(null, user.userId);
  });

  passport.deserializeUser(async (userId, done) => {
    try {
      const user = await prisma.users.findUnique({
        where: { userId: userId as number },
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  kakao();
};

export default passportConfig;