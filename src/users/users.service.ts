// File: services/users-service/backend/src/users/users.service.ts

import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>) {
    this.logger.log(`Creating user: ${JSON.stringify({ ...data, password: '***' })}`);
    try {
      const user = this.userRepository.create({
        ...data,
        isActive: false, // new users start inactive (adjust if needed)
      });
      const saved = await this.userRepository.save(user);
      this.logger.log(`✅ User created with ID: ${saved.id}`);
      return saved;
    } catch (err: any) {
      this.logger.error(`❌ Failed to create user: ${err.message}`, err.stack);
      if (err.code === '23505') throw new ConflictException('Email already exists');
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    search = '',
    role?: string,
    isActive?: boolean,
    includeDeleted = false,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    this.logger.log(
      `Paginated search: page=${page}, limit=${limit}, search="${search}", role=${role}, isActive=${isActive}, includeDeleted=${includeDeleted}`,
    );

    const qb = this.userRepository.createQueryBuilder('user');

    if (includeDeleted) {
      qb.withDeleted();
    } else {
      qb.andWhere('user.deletedAt IS NULL');
    }

    if (search) {
      qb.andWhere('(user.name ILIKE :q OR user.email ILIKE :q)', { q: `%${search}%` });
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (typeof isActive === 'boolean') {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');

    const [users, total] = await qb.getManyAndCount();
    return { users, total, page, limit };
  }

  async findById(id: number): Promise<User> {
    this.logger.log(`Finding user by ID: ${id}`);
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true, // allow reading deleted for admin views
      select: ['id', 'name', 'email', 'password', 'role', 'isActive', 'createdAt', 'updatedAt', 'deletedAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: Partial<User>) {
    this.logger.log(`Updating user ID: ${id} with data: ${JSON.stringify({ ...updateUserDto, password: undefined })}`);
    const user = await this.userRepository.findOne({ where: { id }, withDeleted: true });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.password !== undefined) user.password = updateUserDto.password;

    return this.userRepository.save(user);
  }

  async setActive(id: number, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, withDeleted: true });
    if (!user) throw new NotFoundException('User not found');

    if (user.deletedAt) {
      throw new BadRequestException('Cannot change active status of a deleted user. Restore first.');
    }

    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async softDelete(id: number): Promise<{ success: true }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Force inactive before soft-delete
    if (user.isActive) {
      user.isActive = false;
      await this.userRepository.save(user);
    }
    await this.userRepository.softDelete(id);
    return { success: true };
  }

  async restore(id: number): Promise<{ user: User }> {
    const user = await this.userRepository.findOne({ where: { id }, withDeleted: true });
    if (!user) throw new NotFoundException('User not found');
    if (!user.deletedAt) return { user };

    await this.userRepository.restore(id);
    user.isActive = false; // restored users start inactive by default
    const saved = await this.userRepository.save(user);
    return { user: saved };
  }

  async adminUpdatePassword(id: number, newPassword: string) {
    this.logger.log(`🔐 Admin is updating password for user ID ${id}`);
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(newPassword, 10);
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
}
