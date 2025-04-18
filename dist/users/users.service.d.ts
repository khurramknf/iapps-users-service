import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly userRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>);
    create(data: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
    findAllPaginated(page?: number, limit?: number, search?: string): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: number): Promise<User>;
    findByEmail(email: string): Promise<User>;
    update(id: number, updateUserDto: Partial<User>): Promise<User>;
    softDelete(id: number): Promise<import("typeorm").UpdateResult>;
    restore(id: number): Promise<import("typeorm").UpdateResult>;
}
