import prisma from '../utils/prisma/index';

class UsersRepository {
  getUserWorkspacesAndBoards = async (userId: number) => {
    const workspaces = await prisma.users.findUnique({
      where: { userId: userId },
      select: {
        WorkspacesMembers: {
          select: {
            Workspaces: {
              select: {
                workspaceId: true,
                workspaceName: true,
                Boards: {
                  select: {
                    boardId: true,
                    boardName: true,
                    Color: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return workspaces!.WorkspacesMembers.map((member) => member.Workspaces);
  };

  isMemberOfWorkspace = async (workspaceId: number, userId: number) => {
    const isMember = await prisma.workspacesMembers.findFirst({
      where: {
        UserId: userId,
        WorkspaceId: workspaceId,
      },
    });

    if (!isMember) {
      throw new Error('User is not a member of the workspace.');
    }

    return true;
  };
}

export default UsersRepository;
