import { Request, Response } from 'express';
import asyncHandler from '../lib/asyncHandler';
import ColumnsService from '../services/columns';

class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  getAllColumns = asyncHandler(async (req: Request, res: Response) => {
    const boardId = +req.params.boardId;
    const result = await this.columnsService.getAllColumns(boardId);
    res.status(200).json(result);
  });

  createColumn = asyncHandler(async (req: Request, res: Response) => {
    const boardId = +req.params.boardId;
    const { columnName } = req.body;
    const result = await this.columnsService.createColumn(boardId, columnName);
    res.status(200).send(result);
  });

  updateColumn = asyncHandler(async (req: Request, res: Response) => {
    const columnId = +req.params.columnId;
    const { columnName, columnOrder } = req.body;
    const result = await this.columnsService.updateColumn(
      columnId,
      columnName,
      columnOrder,
    );
    res.status(200).send(result);
  });

  deleteColumn = asyncHandler(async (req: Request, res: Response) => {
    const columnId = +req.params.columnId;
    const result = await this.columnsService.deleteColumn(columnId);
    res.status(200).send(result);
  });
}

export default ColumnsController;
