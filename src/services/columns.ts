import ColumnsRepository from '../repositories/columns';

class ColumnsService {
  constructor(private readonly columnsRepository: ColumnsRepository) {}

  getAllColumns = async (boardId: number) => {
    const result = await this.columnsRepository.getAllColumns(boardId);
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
    userId: number,
    workspaceId: number,
    columnId: number,
    columnName?: string,
    columnOrder?: number,
  ) => {
    const result = await this.columnsRepository.updateColumn(
      userId,
      workspaceId,
      columnId,
      columnName,
      columnOrder,
    );
    return result;
  };

  deleteColumn = async (
    userId: number,
    workspaceId: number,
    columnId: number,
  ) => {
    const result = await this.columnsRepository.deleteColumn(
      userId,
      workspaceId,
      columnId,
    );
    return result;
  };
}

export default ColumnsService;
