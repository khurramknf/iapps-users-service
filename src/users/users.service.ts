// services/users-service/backend/src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User, Role } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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
      const user = this.userRepository.create({
        ...data,
        isActive: false,
      });
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
    search = '',
    role?: string,
    isActive?: boolean,
    includeDeleted = false
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    this.logger.log(`Paginated search: page=${page}, limit=${limit}, search="${search}", role=${role}, isActive=${isActive}, includeDeleted=${includeDeleted}`);

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (includeDeleted) {
      queryBuilder.withDeleted();
    }

    if (search) {
      queryBuilder.andWhere('user.name ILIKE :search OR user.email ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

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

  async adminUpdatePassword(id: number, newPassword: string) {
  this.logger.log(`🔐 Admin is updating password for user ID ${id}`);
  const user = await this.userRepository.findOneBy({ id });
  if (!user) throw new NotFoundException('User not found');

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await this.userRepository.save(user);
  this.logger.log(`✅ Password updated by admin for user ID ${id}`);
  return user;
  }

  async updateRole(id: number, role: Role) {
  const user = await this.userRepository.findOneBy({ id });
  if (!user) throw new NotFoundException('User not found');

  user.role = role;
  return this.userRepository.save(user);
  }

  async toggleActive(id: number, isActive: boolean) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = isActive;
    return this.userRepository.save(user);
  }
  
}
