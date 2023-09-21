import WorkspacesRepository from '../repositories/workspace';

class WorkspacesService {
  constructor(private readonly workspacesRepository: WorkspacesRepository) {}
  createWorkspace = async (workspaceName: string, ownerId: number) => {
    const result = await this.workspacesRepository.createWorkspace(
      workspaceName,
      ownerId,
    );
    return result;
  };
}

export default WorkspacesService;
