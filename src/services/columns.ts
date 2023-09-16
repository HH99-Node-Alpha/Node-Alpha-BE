import ColumnsRepository from '../repositories/columns';
import { ColumnsResponse } from '../types/columns';

class ColumnsService {
  constructor(private readonly columnsRepository: ColumnsRepository) {}

  getAllColumns = async (boardId: number) => {
    const result: ColumnsResponse[] =
      await this.columnsRepository.getAllColumns(boardId);
    return result;
  };

  createColumn = async (boardId: number, columnName: string) => {
    const result = await this.columnsRepository.createColumn(
      boardId,
      columnName,
    );
    return result;
  };

  updateColumn = async (
    columnId: number,
    columnName?: string,
    columnOrder?: number,
  ) => {
    const result = await this.columnsRepository.updateColumn(
      columnId,
      columnName,
      columnOrder,
    );
    return result;
  };

  deleteColumn = async (columnId: number) => {
    const result = await this.columnsRepository.deleteColumn(columnId);
    return result;
  };
}

export default ColumnsService;
