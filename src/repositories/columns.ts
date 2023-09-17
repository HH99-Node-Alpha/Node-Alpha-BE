import prisma from '../utils/prisma/index';

class ColumnsRepository {
  getAllColumns = async (boardId: number) => {
    const columns = await prisma.columns.findMany({
      where: { BoardId: boardId },
      select: {
        columnId: true,
        columnName: true,
        columnOrder: true,
      },
      orderBy: { columnOrder: 'asc' },
    });

    const modifiedColumns = columns.map((column) => ({
      columnId: String(column.columnId),
      columnName: column.columnName,
      columnOrder: column.columnOrder,
    }));

    return { columns: modifiedColumns };
  };

  createColumn = async (boardId: number, columnName: string) => {
    const lastColumn = await prisma.columns.findFirst({
      where: { BoardId: boardId },
      orderBy: { columnOrder: 'desc' },
      select: { columnOrder: true },
    });

    const lastOrder = lastColumn?.columnOrder || 0;
    const newOrder = lastOrder + 1;

    const newColumn = await prisma.columns.create({
      data: { columnName, BoardId: boardId, columnOrder: newOrder },
    });

    return {
      message: 'success',
      column: {
        columnId: String(newColumn.columnId),
        columnName: newColumn.columnName,
        columnOrder: newColumn.columnOrder,
      },
    };
  };

  updateColumn = async (
    columnId: number,
    columnName?: string,
    columnOrder?: number,
  ) => {
    const dataToUpdate: any = {};

    if (columnName) {
      dataToUpdate.columnName = columnName;
    }

    if (columnOrder !== undefined) {
      dataToUpdate.columnOrder = columnOrder;
    }

    const updatedColumn = await prisma.columns.update({
      where: { columnId: columnId },
      data: dataToUpdate,
    });

    return {
      columnId: String(updatedColumn.columnId),
      columnName: updatedColumn.columnName,
      columnOrder: updatedColumn.columnOrder,
    };
  };

  deleteColumn = async (columnId: number) => {
    await prisma.columns.delete({
      where: { columnId },
    });

    return { message: 'success' };
  };
}

export default ColumnsRepository;
