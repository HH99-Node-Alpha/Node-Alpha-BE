import prisma from '../utils/prisma';

class WorkspacesRepository {
  createWorkspace = async (workspaceName: string, ownerId: number) => {
    const workspace = await prisma.workspaces.create({
      data: {
        workspaceName: workspaceName,
        ownerId: ownerId,
        WorkspacesMembers: {
          create: {
            UserId: ownerId,
          },
        },
      },
    });

    return workspace;
  };
}

export default WorkspacesRepository;
