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
                ownerId: true,
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

  isMemberOfWorkspace = async (userId: number, workspaceId: number) => {
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

  searchUser = async (email: string, name: string, workspaceId: number) => {
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

    // 이미 워크스페이스에 존재하는 사용자를 찾아낸다.
    const existingMembers = await prisma.workspacesMembers.findMany({
      where: {
        WorkspaceId: workspaceId,
      },
    });

    // 이미 존재하는 멤버의 ID들을 배열로 만든다.
    const existingMemberIds = existingMembers.map((member) => member.UserId);

    // 검색 조건에 이미 워크스페이스에 존재하는 사용자를 제외한다.
    const result = await prisma.users.findMany({
      where: {
        NOT: {
          userId: {
            in: existingMemberIds,
          },
        },
        OR: filters,
      },
      select: {
        userId: true,
        email: true,
        name: true,
      },
    });

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
  getInvitations = async (userId: number, userName: any) => {
    try {
      const invitations = await prisma.invitations.findMany({
        where: { InvitedByUserId: userId, accepted: null },
      });

      // invitations 깊은복사
      const result = JSON.parse(JSON.stringify(invitations));

      for (let i = 0; i < result.length; i++) {
        const workspaceName = await prisma.workspaces.findUnique({
          where: { workspaceId: result[i].WorkspaceId },
          select: { workspaceName: true },
        });
        result[i]['workspaceName'] = workspaceName?.workspaceName;
        result[i]['userName'] = userName;
      }
      // console.log('result:', result);
      return result;
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
          // isRead: False,
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
    const updatedUser = await prisma.users.update({
      where: { userId: loginUser },
      data: { lastLogin: now },
    });
    return updatedUser;
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

  // socket8(workspace 이름, 이미지 변경)
  updateWorkspace = async (
    userId: number,
    workspaceId: number,
    workspaceName: string,
    workspaceImage: string,
  ) => {
    const updatedWorkspace = await prisma.workspaces.update({
      where: { ownerId: userId, workspaceId },
      data: { workspaceName, workspaceImage },
    });

    const result = {
      workspaceId: updatedWorkspace.workspaceId,
      workspaceName: updatedWorkspace.workspaceName,
      workspaceImage: updatedWorkspace.workspaceImage,
    };

    return result;
  };

  // socket9(invitations - isRead Ok)
  chekcNotification = async (
    invitedByUserId: number,
    invitationIds: number[],
  ) => {
    const user = await prisma.users.findUnique({
      where: { userId: invitedByUserId },
    });

    const result = [];
    // 각 초대장에 필요한 정보들: invitationId, userId, userName, workspaceId, workspaceName, isRead
    for (const invitationId of invitationIds) {
      const updated = await prisma.invitations.update({
        where: { invitationId },
        data: { isRead: true },
      });

      const workspace = await prisma.workspaces.findUnique({
        where: { workspaceId: updated.WorkspaceId },
      });

      const updated2 = {
        invitationId: updated.invitationId,
        userId: invitedByUserId,
        userName: user?.name,
        workspaceId: updated.WorkspaceId,
        workspaceName: workspace?.workspaceName,
        isRead: updated.isRead,
      };
      result.push(updated2);
    }

    return result; // 통째로 보내기
  };
}

export default UsersRepository;
