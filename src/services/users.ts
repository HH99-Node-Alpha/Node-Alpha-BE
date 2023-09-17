import UsersRepository from '../repositories/users';

class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getUserWorkspacesAndBoards = async (userId: number) => {
    const result =
      await this.usersRepository.getUserWorkspacesAndBoards(userId);
    return result;
  };
}

export default UsersService;
