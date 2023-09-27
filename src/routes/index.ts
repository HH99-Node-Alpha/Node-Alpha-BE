import express from 'express';
import SignupRouter from './signup';
import LoginRouter from './login';
import BoardsRouter from './boards';
import ColumnsRouter from './columns';
import UsersRouter from './users';
import WorkspacesRouter from './workspaces';
import authMiddleware from '../middlewares/auth';
import UtilsRouter from './utils';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!!!Alpha+ is number one!');
});

router.use('/', [SignupRouter, LoginRouter, UtilsRouter]);
router.use(authMiddleware);
router.use('/users', UsersRouter);
router.use('/workspaces/:workspaceId', BoardsRouter);
router.use('/workspaces/:workspaceId/boards/:boardId', ColumnsRouter);
router.use('/workspaces', WorkspacesRouter);

export default router;
