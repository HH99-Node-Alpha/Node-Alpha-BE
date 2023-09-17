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
                  },
                },
              },
            },
          },
        },
      },
    });
    console.log(workspaces);
    return workspaces!.WorkspacesMembers.map((member) => member.Workspaces);
  };
}

export default UsersRepository;
