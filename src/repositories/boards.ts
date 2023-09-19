import prisma from '../utils/prisma/index';

class BoardsRepository {
  getAllBoards = async (workspaceId: number) => {
    const boards = await prisma.boards.findMany({
      where: { WorkspaceId: workspaceId },
    });
    return boards;
  };

  getOneBoard = async (boardId: number) => {
    const board = await prisma.boards.findFirst({
      where: { boardId },
    });
    return board;
  };

  createBoard = async (workspaceId: number, boardName: string) => {
    await prisma.boards.create({
      data: { WorkspaceId: workspaceId, boardName, colorId: 1 },
    });

    return { message: 'success' };
  };

  updateBoard = async (
    boardId: number,
    boardName?: string,
    boardColor?: string,
  ) => {
    const dataToUpdate: any = {};

    if (boardName) {
      dataToUpdate.boardName = boardName;
    }

    if (boardColor) {
      dataToUpdate.boardColor = boardColor;
    }

    await prisma.boards.update({
      where: { boardId: boardId },
      data: dataToUpdate,
    });

    return { message: 'success' };
  };

  deleteBoard = async (columnId: number) => {
    await prisma.columns.delete({
      where: { columnId },
    });

    return { message: 'success' };
  };
}

export default BoardsRepository;
