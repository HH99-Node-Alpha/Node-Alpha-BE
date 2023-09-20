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
}

export default UsersController;
