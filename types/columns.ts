export interface ColumnResponse {
  columnId: number;
  boardId: number;
  columnName: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  columnOrder: number;
}
