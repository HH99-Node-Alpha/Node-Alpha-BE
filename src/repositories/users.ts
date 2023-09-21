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

  searchUser = async (email: string, name: string) => {
    const filters = [];

    if (email) {
      filters.push({
        email: {
          contains: email as string,
        },
      });
    }

    if (name) {
      filters.push({
        name: {
          contains: name as string,
        },
      });
    }

    const result = await prisma.users.findMany({
      where: {
        OR: filters,
      },
      select: {
        userId: true,
        email: true,
        name: true,
      },
    });

    console.log(email, name, result);
    return result;
  };
}

export default UsersRepository;
