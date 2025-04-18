// services/users-service/backend/src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(data: Partial<User>) {
    this.logger.log(`Creating user: ${JSON.stringify(data)}`);
    try {
      const user = this.userRepository.create(data);
      const saved = await this.userRepository.save(user);
      this.logger.log(`✅ User created with ID: ${saved.id}`);
      return saved;
    } catch (err: any) {
      this.logger.error(`❌ Failed to create user: ${err.message}`, err.stack);
      if (err.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    search = ''
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log(`Paginated search: page=${page}, limit=${limit}, search="${search}"`);

    const [users, total] = await this.userRepository.findAndCount({
      where: [
        { name: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { users, total, page, limit };
  }

  async findById(id: number): Promise<User> {
    this.logger.log(`Finding user by ID: ${id}`);
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'password', 'role', 'createdAt', 'updatedAt']
    });
    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: Partial<User>) {
    this.logger.log(`Updating user ID: ${id} with data: ${JSON.stringify(updateUserDto)}`);
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      this.logger.warn(`User not found for update: ID ${id}`);
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.password !== undefined)
      user.password = updateUserDto.password;

    return this.userRepository.save(user);
  }

  async softDelete(id: number) {
    this.logger.log(`Soft deleting user ID: ${id}`);
    return this.userRepository.softDelete(id);
  }

  async restore(id: number) {
    this.logger.log(`Restoring user ID: ${id}`);
    return this.userRepository.restore(id);
  }
}
