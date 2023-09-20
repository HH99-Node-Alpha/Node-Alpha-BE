import prisma from '../utils/prisma/index';

class BoardsRepository {
  getAllBoards = async (workspaceId: number) => {
    const boards = await prisma.boards.findMany({
      where: { WorkspaceId: workspaceId },
      include: {
        Color: true,
      },
    });
    return boards;
  };

  getOneBoard = async (boardId: number) => {
    const board = await prisma.boards.findFirst({
      where: { boardId },
      include: {
        Color: true,
      },
    });
    return board;
  };

  createBoard = async (workspaceId: number, boardName: string) => {
    const allColors = await prisma.colors.findMany();
    const randomColor = allColors[Math.floor(Math.random() * allColors.length)];
    const randomColorId = randomColor.colorId;

    await prisma.boards.create({
      data: { WorkspaceId: workspaceId, boardName, colorId: randomColorId },
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

  getAllColors = async () => {
    const colors = await prisma.colors.findMany({});
    return colors;
  };
}

export default BoardsRepository;
