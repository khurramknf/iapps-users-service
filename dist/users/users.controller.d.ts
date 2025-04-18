import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    create(createDto: any): Promise<{
        user: import("./entities/user.entity").User;
    }>;
    findAllPaginated(page?: string, limit?: string, search?: string): Promise<{
        users: import("./entities/user.entity").User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<{
        user: import("./entities/user.entity").User;
    }>;
    findByEmail(email: string): Promise<{
        user: import("./entities/user.entity").User;
    }>;
    update(id: string, updateDto: any): Promise<{
        user: import("./entities/user.entity").User;
    }>;
    softDelete(id: string): Promise<import("typeorm").UpdateResult>;
    restore(id: string): Promise<import("typeorm").UpdateResult>;
}
