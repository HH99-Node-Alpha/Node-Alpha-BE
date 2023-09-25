import UsersRepository from '../repositories/users';

class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getUserWorkspacesAndBoards = async (userId: number) => {
    const result =
      await this.usersRepository.getUserWorkspacesAndBoards(userId);
    return result;
  };

  searchUser = async (email: string, name: string, workspaceId: number) => {
    const result = await this.usersRepository.searchUser(
      email,
      name,
      workspaceId,
    );
    return result;
  };
}

export default UsersService;
