import express from 'express';
import UsersRouter from './users';
import ColumnsRouter from './columns';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!!!!Alpha Zzang@@');
});

router.use('/', UsersRouter);
router.use('/workspaces/:workspaceId/boards/:boardId', ColumnsRouter);

export default router;
