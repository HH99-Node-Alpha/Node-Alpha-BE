import express from 'express';
import SignupRouter from './signup';
import LoginRouter from './login';
import BoardsRouter from './boards';
import ColumnsRouter from './columns';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!!!Alpha+ is number one!');
});

router.use('/', [SignupRouter, LoginRouter]);
router.use('/workspaces/:workspaceId', BoardsRouter);
router.use('/workspaces/:workspaceId/boards/:boardId', ColumnsRouter);

export default router;
