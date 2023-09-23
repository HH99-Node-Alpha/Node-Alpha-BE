import prisma from '../utils/prisma';
import BoardsRepository from './boards';

class WorkspacesRepository {
  constructor(private readonly boardsRepository: BoardsRepository) {}
  async createWorkspace(workspaceName: string, ownerId: number) {
    const workspace = await prisma.workspaces.create({
      data: {
        workspaceName,
        ownerId,
        WorkspacesMembers: {
          create: {
            UserId: ownerId,
          },
        },
      },
    });

    const existingBoards = await prisma.boards.findMany({
      where: {
        WorkspaceId: workspace.workspaceId,
      },
    });

    if (existingBoards.length === 0) {
      // 워크스페이스에 연결된 보드가 없을 경우
      const user = await prisma.users.findUnique({
        where: { userId: ownerId },
      });

      if (user) {
        const boardName = `${user.name}의 Board`;
        await this.boardsRepository.createBoard(
          workspace.workspaceId,
          boardName,
        );
      }
    }

    return workspace;
  }
}

export default WorkspacesRepository;
