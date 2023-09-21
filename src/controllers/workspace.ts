import { Request, Response } from 'express';
import WorkspacesService from '../services/workspace';

class WorkspacesController {
  constructor(private readonly workspaceService: WorkspacesService) {}
  createWorkspace = async (req: Request, res: Response) => {
    try {
      const { workspaceName } = req.body;
      const user: any = req.user!;
      const ownerId = user.userId;

      const result = await this.workspaceService.createWorkspace(
        workspaceName,
        ownerId,
      );

      res.json(result);
    } catch (error) {
      console.error('Error message:', error);
      res.status(500).send('error');
    }
  };
}

export default WorkspacesController;
