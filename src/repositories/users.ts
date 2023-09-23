import prisma from '../utils/prisma/index';
import { CustomError } from '../errors/customError';

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

  // socket1(초대를 받은 경우 -> workspaceMember생성)
  createWorkspaceMember = async (workspaceId: number, userId: number) => {
    try {
      const createdWorkspaceMember = await prisma.workspacesMembers.create({
        data: { WorkspaceId: workspaceId, UserId: userId },
      });
      return createdWorkspaceMember;
    } catch (err) {
      throw new CustomError(412, '입력값이 올바르지 않습니다');
    }
  };

  // socket2(유저찾기 - userId로만)
  getUser = async (userId: number) => {
    try {
      const user = await prisma.users.findUnique({
        where: { userId },
      });
      return user;
    } catch (err) {
      throw new CustomError(412, '입력값이 올바르지 않습니다');
    }
  };

  // socket3(invitaions테이블 전체 조회)
  getInvitations = async (userId: number) => {
    try {
      const invitations = await prisma.invitations.findMany({
        where: { InvitedByUserId: userId, accepted: null },
      });
      return invitations;
    } catch (err) {
      throw new CustomError(412, '입력값이 올바르지 않습니다');
    }
  };

  // socket4(invitaions테이블 만들기)
  createInvitations = async (
    workspaceId: number,
    invitedUserId: number,
    invitedByUserId: number,
  ) => {
    try {
      const createdInvitations = await prisma.invitations.create({
        data: {
          WorkspaceId: workspaceId,
          InvitedUserId: invitedUserId, // 초대한 사람
          InvitedByUserId: invitedByUserId, // 초대 받은 사람
        },
      });
      return createdInvitations;
    } catch (err) {
      throw new CustomError(412, '입력값이 올바르지 않습니다');
    }
  };

  // socket5(invitations테이블 - accepted상태 업데이트하기)
  acceptInvitations = async (invitationId: number, accepted: boolean) => {
    try {
      const updatedInvitations = await prisma.invitations.update({
        where: { invitationId },
        data: { accepted },
      });
      return updatedInvitations;
    } catch (err) {
      throw new CustomError(412, '입력값이 올바르지 않습니다');
    }
  };

  // socket5-2(invitations테이블 - accepted: false, 인자는 3개)
  declineInvitations = async (
    invitationId: number,
    accepted: boolean,
    deletedAt: Date,
  ) => {
    try {
      const updatedInvitations = await prisma.invitations.update({
        where: { invitationId },
        data: { accepted, deletedAt },
      });
      return updatedInvitations;
    } catch (err) {
      throw new CustomError(412, '입력값이 올바르지 않습니다');
    }
  };

  // socket6(유저 lastLogin업데이트)
  updateLastloginUser = async (loginUser: any, now: Date) => {
    try {
      const updatedUser = await prisma.users.update({
        where: { userId: loginUser },
        data: { lastLogin: now },
      });
      return updatedUser;
    } catch (err) {
      throw new CustomError(412, '입력값이 올바르지 않습니다');
    }
  };

  // socket7(workspace조회용 - 임시로 여기에 새로 만들고, 배치)
  getWorkspaceName = async (workspaceId: number) => {
    try {
      const workspace = await prisma.workspaces.findUnique({
        where: { workspaceId },
      });
      return workspace?.workspaceName;
    } catch (err) {
      throw new CustomError(412, '입력값이 올바르지 않습니다');
    }
  };
}

export default UsersRepository;
