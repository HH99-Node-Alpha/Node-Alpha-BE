import BoardsRepository from '../repositories/boards';

class BoardsService {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  getAllBoards = async (workspaceId: number) => {
    const result = await this.boardsRepository.getAllBoards(workspaceId);
    return result;
  };

  createBoard = async (boardId: number, boardName: string) => {
    const result = await this.boardsRepository.createBoard(boardId, boardName);
    return result;
  };

  updateBoard = async (
    boardId: number,
    boardName?: string,
    boardColor?: string,
  ) => {
    const result = await this.boardsRepository.updateBoard(
      boardId,
      boardName,
      boardColor,
    );
    return result;
  };

  deleteBoard = async (boardId: number) => {
    const result = await this.boardsRepository.deleteBoard(boardId);
    return result;
  };
}

export default BoardsService;
