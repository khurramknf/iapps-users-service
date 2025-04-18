"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = UsersService_1 = class UsersService {
    userRepository;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(data) {
        this.logger.log(`Creating user: ${JSON.stringify(data)}`);
        try {
            const user = this.userRepository.create(data);
            const saved = await this.userRepository.save(user);
            this.logger.log(`✅ User created with ID: ${saved.id}`);
            return saved;
        }
        catch (err) {
            this.logger.error(`❌ Failed to create user: ${err.message}`, err.stack);
            if (err.code === '23505') {
                throw new common_1.ConflictException('Email already exists');
            }
            throw new common_1.InternalServerErrorException('Failed to create user');
        }
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findAllPaginated(page = 1, limit = 10, search = '') {
        this.logger.log(`Paginated search: page=${page}, limit=${limit}, search="${search}"`);
        const [users, total] = await this.userRepository.findAndCount({
            where: [
                { name: (0, typeorm_2.ILike)(`%${search}%`) },
                { email: (0, typeorm_2.ILike)(`%${search}%`) },
            ],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { users, total, page, limit };
    }
    async findById(id) {
        this.logger.log(`Finding user by ID: ${id}`);
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'password', 'role', 'createdAt', 'updatedAt']
        });
        if (!user) {
            this.logger.warn(`User not found with ID: ${id}`);
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        this.logger.log(`Finding user by email: ${email}`);
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            this.logger.warn(`User not found with email: ${email}`);
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async update(id, updateUserDto) {
        this.logger.log(`Updating user ID: ${id} with data: ${JSON.stringify(updateUserDto)}`);
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            this.logger.warn(`User not found for update: ID ${id}`);
            throw new common_1.NotFoundException('User not found');
        }
        if (updateUserDto.name !== undefined)
            user.name = updateUserDto.name;
        if (updateUserDto.email !== undefined)
            user.email = updateUserDto.email;
        if (updateUserDto.password !== undefined)
            user.password = updateUserDto.password;
        return this.userRepository.save(user);
    }
    async softDelete(id) {
        this.logger.log(`Soft deleting user ID: ${id}`);
        return this.userRepository.softDelete(id);
    }
    async restore(id) {
        this.logger.log(`Restoring user ID: ${id}`);
        return this.userRepository.restore(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map