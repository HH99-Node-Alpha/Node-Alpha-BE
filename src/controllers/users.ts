import { Request, Response } from 'express';
import asyncHandler from '../lib/asyncHandler';
import UsersService from '../services/users';

class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getUserWorkspacesAndBoards = asyncHandler(
    async (req: Request, res: Response) => {
      const user: any = req.user!;
      const userId = user.userId;
      const result = await this.usersService.getUserWorkspacesAndBoards(userId);
      res.status(200).json(result);
    },
  );

  searchUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, name } = req.query;
    if (typeof email !== 'string' || typeof name !== 'string') {
      res.status(400).json({ error: 'Invalid parameters' });
      return;
    }
    const result = await this.usersService.searchUser(email, name);

    res.status(200).json(result);
  });
}

export default UsersController;
