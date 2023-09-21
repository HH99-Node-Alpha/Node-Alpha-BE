import express from 'express';
import UsersController from '../controllers/users';
import UsersRepository from '../repositories/users';
import UsersService from '../services/users';
const router = express.Router();

const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

router.get('/', usersController.getUserWorkspacesAndBoards);
router.get('/search', usersController.searchUser);

export default router;
