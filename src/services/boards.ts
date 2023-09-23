import BoardsRepository from '../repositories/boards';

class BoardsService {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  getAllBoards = async (workspaceId: number) => {
    const result = await this.boardsRepository.getAllBoards(workspaceId);
    return result;
  };

  getOneBoard = async (boardId: number) => {
    const result = await this.boardsRepository.getOneBoard(boardId);
    return result;
  };

  createBoard = async (boardId: number, boardName: string) => {
    const result = await this.boardsRepository.createBoard(boardId, boardName);
    return result;
  };

  updateBoard = async (
    userId: number,
    workspaceId: number,
    boardId: number,
    boardName?: string,
    colorId?: number,
  ) => {
    const result = await this.boardsRepository.updateBoard(
      userId,
      workspaceId,
      boardId,
      boardName,
      colorId,
    );
    return result;
  };

  deleteBoard = async (
    userId: number,
    workspaceId: number,
    boardId: number,
  ) => {
    const result = await this.boardsRepository.deleteBoard(
      userId,
      workspaceId,
      boardId,
    );
    return result;
  };

  getAllColors = async () => {
    const result = await this.boardsRepository.getAllColors();
    return result;
  };
}

export default BoardsService;
