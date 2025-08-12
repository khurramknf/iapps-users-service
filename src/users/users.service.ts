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
    private readonly userRepository: Repository<User>,
  ) {}

  // ---------- Search (used by Organizations -> Members modal) ----------
  async search(
    query: string,
    limit = 20,
    activeOnly = true,
  ): Promise<Array<Pick<User, 'id' | 'name' | 'email' | 'isActive'>>> {
    const q = (query || '').trim();
    if (!q) return [];

    const take = Math.min(50, Math.max(1, limit));
    const qb = this.userRepository
      .createQueryBuilder('u')
      .where('(u.name ILIKE :q OR u.email ILIKE :q)', { q: `%${q}%` })
      .orderBy('u.name', 'ASC')
      .addOrderBy('u.id', 'ASC')
      .take(take);

    if (activeOnly) {
      qb.andWhere('u.isActive = :active', { active: true });
    }

    // soft-deleted excluded by default
    const rows = await qb
      .select(['u.id', 'u.name', 'u.email', 'u.isActive'])
      .getMany();

    return rows;
  }

  // ✅ FIXED: use userRepository (not repo) + sane defaults
  async searchLite(opts: { q: string; limit?: number; activeOnly?: boolean }) {
    const q = (opts.q || '').trim();
    if (!q) return []; // match your curl result for empty query

    const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
    const activeOnly = opts.activeOnly !== false;

    const users = await this.userRepository.find({
      where: [{ name: ILike(`%${q}%`) }, { email: ILike(`%${q}%`) }],
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'email', 'isActive'],
      // (no withDeleted) => excludes soft-deleted
    });

    return activeOnly ? users.filter((u) => u.isActive) : users;
  }

  // ---------- Existing methods ----------
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

    if (includeDeleted) qb.withDeleted();
    else qb.andWhere('user.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (role) qb.andWhere('user.role = :role', { role });
    if (typeof isActive === 'boolean') {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    qb.skip((page - 1) * limit).take(limit).orderBy('user.createdAt', 'DESC');

    const [users, total] = await qb.getManyAndCount();
    return { users, total, page, limit };
  }

  async findById(id: number): Promise<User> {
    this.logger.log(`Finding user by ID: ${id}`);
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: false,
      select: [
        'id',
        'name',
        'email',
        'password',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.userRepository.findOne({ where: { email } });
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
    if (updateUserDto.password !== undefined) user.password = updateUserDto.password;

    return this.userRepository.save(user);
  }

  async setActive(id: number, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });
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

    if (user.isActive) {
      user.isActive = false;
      await this.userRepository.save(user);
    }
    await this.userRepository.softDelete(id);
    return { success: true };
  }

  async restore(id: number): Promise<{ success: true }> {
    const user = await this.userRepository.findOne({ where: { id }, withDeleted: true });
    if (!user) throw new NotFoundException('User not found');

    if (!user.deletedAt) return { success: true };
    await this.userRepository.restore(id);
    user.isActive = false;
    await this.userRepository.save(user);
    return { success: true };
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
}
