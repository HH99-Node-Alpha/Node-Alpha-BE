import express from "express";
import UsersRouter from "./users";
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!!!!Alpha Zzang@@')
})

router.use('/', UsersRouter);

export default router;
