import { Request, Response } from 'express';
import asyncHandler from '../lib/asyncHandler';
import BoardsService from '../services/boards';

class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  getAllBoards = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = +req.params.workspaceId;
    const result = await this.boardsService.getAllBoards(workspaceId);
    res.status(200).json(result);
  });

  getOneBoard = asyncHandler(async (req: Request, res: Response) => {
    const boardId = +req.params.boardId;
    const result = await this.boardsService.getOneBoard(boardId);
    res.status(200).json(result);
  });

  createBoard = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = +req.params.workspaceId;
    const { boardName } = req.body;
    const result = await this.boardsService.createBoard(workspaceId, boardName);
    res.status(200).send(result);
  });

  updateBoard = asyncHandler(async (req: Request, res: Response) => {
    const boardId = +req.params.boardId;
    const { boardName, colorId } = req.body;
    const result = await this.boardsService.updateBoard(
      boardId,
      boardName,
      colorId,
    );
    res.status(200).send(result);
  });

  deleteBoard = asyncHandler(async (req: Request, res: Response) => {
    const boardId = +req.params.boardId;
    const result = await this.boardsService.deleteBoard(boardId);
    res.status(200).send(result);
  });

  getAllColors = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.boardsService.getAllColors();
    res.status(200).send(result);
  });
}

export default BoardsController;
