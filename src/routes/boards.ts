import express from 'express';
import BoardsController from '../controllers/boards';
import BoardsRepository from '../repositories/boards';
import BoardsService from '../services/boards';

const router = express.Router({ mergeParams: true });

const boardsRepository = new BoardsRepository();
const boardsService = new BoardsService(boardsRepository);
const boardsController = new BoardsController(boardsService);

router.get('/boards', boardsController.getAllBoards);
router.get('/boards/:boardId', boardsController.getOneBoard);
router.post('/boards', boardsController.createBoard);
router.put('/boards/:boardId', boardsController.updateBoard);
router.delete('/boards/:boardId', boardsController.deleteBoard);

export default router;
