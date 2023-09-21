import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/auth';
import WorkspacesRepository from '../repositories/workspace';
import WorkspacesService from '../services/workspace';
import WorkspacesController from '../controllers/workspace';

const prisma = new PrismaClient();
const router = express.Router();

const workspacesRepository = new WorkspacesRepository();
const workspacesService = new WorkspacesService(workspacesRepository);
const workspacesController = new WorkspacesController(workspacesService);

//** PB내용 수정해야할거 ***/
// express 전역 써서 하기 -> 아래꺼써서 하기
// const user: any = req.user!;
// const userId = user.userId;

//  ** 워크스페이스 API 비즈니스 로직**

// 1. 워크스페이스를 작성하려는 클라이언트가 로그인된 사용자인지 검증합니다.
// 2. 워스페이스 생성을 위한 `workspacename`를 **body**로 전달받습니다.
// 3. **workspaces** 테이블에 게시글을 생성합니다.

//** 워크스페이스생성 **//
// router.post('/create', authMiddleware, async (req, res) => {
//   try {
//     const { workspaceName, ownerId } = req.body;
//     const workspace = await prisma.workspaces.create({
//       data: {
//         workspaceName,
//         ownerId,
//       },
//     });
//     res.json(workspace);
//   } catch (error) {
//     console.error('Error message:', error);
//     res.status(500).send('error');
//   }
// });
// 전역 express 사용하기 // const user: any = req.user!; //const userId = user.userId;

router.post('/', workspacesController.createWorkspace);

//** 워크스페이스 조회 **//
// router.get('/:workspaceId', authMiddleware, async (req, res) => {
//   try {
//     const { workspaceId } = req.params;
//     const workspace = await prisma.workspaces.findUnique({
//       where: {
//         workspaceId: +workspaceId,
//       },
//     });
//     res.json(workspace);
//   } catch (error) {
//     console.error('Error message:', error);
//     res.status(500).send('error');
//   }
// });

// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const workspaces = await prisma.workspaces.findMany();
//     res.json(workspaces);
//   } catch (error) {
//     console.error('Error message', error);
//     res.status(500).send('error');
//   }
// });

router.get('/:workspaceId', authMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const user: any = req.user!;
    const userId = user.userId;

    const workspace = await prisma.workspaces.findUnique({
      where: {
        workspaceId: +workspaceId,
      },
    });

    if (!workspace) {
      return res.status(404).send('error');
    }

    if (workspace.ownerId !== userId) {
      return res.status(403).send('error');
    }

    res.json(workspace);
  } catch (error) {
    console.error('Error message:', error);
    res.status(500).send('error');
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user: any = req.user!;
    const userId = user.userId;

    const workspaces = await prisma.workspaces.findMany({
      where: {
        ownerId: userId,
      },
    });

    res.json(workspaces);
  } catch (error) {
    console.error('Error message', error);
    res.status(500).send('error');
  }
});

//** 워크스페이스 수정 **//
// router.put('/workspaces/:workspaceId', authMiddleware, async (req, res) => {
//   try {
//     const { workspaceId, userId} = req.params;
//     const { workspaceName } = req.body;

//     // workspace를 조회
//     const workspace = await prisma.workspaces.findUnique({
//       where: {
//         workspaceId: +workspaceId,
//       },
//     });

//     // workspace가 없는 경우
//     if (!workspace) {
//       return res.status(404).send('error');
//     }

//     // ownerId로 1차 검증
//     if (workspace.ownerId !== req.body.ownerId) {
//       // userId로 2차 검증
//       const member = await prisma.workspacesMembers.findFirst({
//         where: {
//           WorkspaceId: workspace.workspaceId,
//           UserId: req.user,
//         },
//       });

//       // userId로도 검증 실패
//       if (!member) {
//         return res.status(403).send('Not authorized');
//       }
//     }

//     // 검증 후 workspace 업데이트
//     const updatedWorkspace = await prisma.workspaces.update({
//       where: {
//         workspaceId: +workspaceId,
//       },
//       data: {
//         workspaceName,
//       },
//     });

//     res.json(updatedWorkspace);

//   } catch (error) {
//     console.error('Error', error);
//     res.status(500).send('error');
//   }
// });

router.put('/workspaces/:workspaceId', authMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { workspaceName } = req.body;

    const user: any = req.user!;
    const ownerId = user.userId;

    // workspace 조회
    const workspace = await prisma.workspaces.findUnique({
      where: {
        workspaceId: +workspaceId,
      },
    });

    // workspace가 없으면
    if (!workspace) {
      return res.status(404).send('error');
    }

    // ownerId 검증
    if (workspace.ownerId !== ownerId) {
      return res.status(403).send('error');
    }

    // 검증 후 workspace 업데이트
    const updatedWorkspace = await prisma.workspaces.update({
      where: {
        workspaceId: +workspaceId,
      },
      data: {
        workspaceName,
      },
    });

    res.json(updatedWorkspace);
  } catch (error) {
    console.error('Error', error);
    res.status(500).send('error');
  }
});

//** 워크스페이스 삭제 **//

// router.delete('/workspaces/:workspaceId', authMiddleware, async (req, res) => {
//   try {
//     const { workspaceId } = req.params;
//     const deletedWorkspace = await prisma.workspaces.delete({
//       where: {
//         workspaceId: +workspaceId
//       },
//     });
//     res.json(deletedWorkspace);
//   } catch (error) {
//     console.error('Error message:', error);
//     res.status(500).send('error');
//   }
// });
router.delete('/workspaces/:workspaceId', authMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const user: any = req.user!;
    const ownerId = user.userId;

    // workspace를 조회
    const workspace = await prisma.workspaces.findUnique({
      where: {
        workspaceId: +workspaceId,
      },
    });

    // workspace가 없는 경우
    if (!workspace) {
      return res.status(404).send('error');
    }

    // ownerId 검증: 소유자만 삭제 가능
    if (workspace.ownerId !== ownerId) {
      return res.status(403).send('error');
    }

    // 검증 후 workspace 삭제
    const deletedWorkspace = await prisma.workspaces.delete({
      where: {
        workspaceId: +workspaceId,
      },
    });

    res.json(deletedWorkspace);
  } catch (error) {
    console.error('Error message:', error);
    res.status(500).send('error');
  }
});

// // ** 워크스페이스 멤버 ** //

// type WorkspacesMembersInput = {
//   WorkspaceId: number;
//   UserId: number;
//   ownerId : string
// };

// type FetchWorkspaceMemberParams = {
//   id: string;
// };

// router.post('/workspace-member', async (req, res) => {
//   try {
//       const data: WorkspacesMembersInput = req.body;

//       // 워크스페이스의 ownerId 가져오기
//       const workspace = await prisma.workspaces.findUnique({
//           where: { workspaceId: data.WorkspaceId },
//           select: { ownerId: true }
//       });

//       // 워크스페이스가 없거나 사용자가 워크스페이스의 소유자가 아닌 경우 오류 반환
//       if (!workspace || workspace.ownerId !== data.UserId) {
//           return res.status(403).json({ error: "error" });
//       }

//       const member = await prisma.workspacesMembers.create({
//           data: {
//               WorkspaceId: data.WorkspaceId,
//               UserId: data.UserId,
//               // ownerId: workspace.ownerId
//               //  // ***** 여기 왜 안됨? ㅠㅠㅠㅠ
//           },
//       });

//       res.json(member);
//   } catch (error) {
//       console.error("Error", error);
//       res.status(500).json({ error: "error" });
//   }
// });

// router.get('/workspace-member/:id', async (req, res) => {
//   try {
//       const params: FetchWorkspaceMemberParams = req.params;
//       const id = +params.id;
//       const member = await prisma.workspacesMembers.findUnique({
//           where: { memberId: id },
//       });
//       if (!member) {
//           return res.status(404).json({ error: "error" });
//       }
//       res.json(member);
//   } catch (error) {
//       console.error("Error", error);
//       res.status(500).json({ error: "error" });
//   }
// });

export default router;
