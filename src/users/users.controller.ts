// File: services/users-service/backend/src/users/users.controller.ts

import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Put,
  Patch,
  Delete,
  Query,
  Logger,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Role, User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createDto: any) {
    this.logger.log(`🟢 Create user → ${JSON.stringify(createDto)}`);
    const user = await this.usersService.create(createDto);
    this.logger.log(`✅ Created user with ID: ${user.id}`);
    return { user };
  }

  @Get()
  async findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const pageNum = parseInt(page ?? '1');
    const limitNum = parseInt(limit ?? '10');
    const includeDeletedBool = includeDeleted === 'true';

    this.logger.log(
      `🔎 Fetching users with filters → page=${pageNum}, limit=${limitNum}, search="${search}", role="${role}", isActive="${isActive}", includeDeleted=${includeDeletedBool}`
    );

    const isActiveBool =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    const data = await this.usersService.findAllPaginated(
      pageNum,
      limitNum,
      search || '',
      role,
      isActiveBool,
      includeDeletedBool,
    );
    
    this.logger.log(`✅ Returned ${data.users.length} users`);
    return data;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    this.logger.log(`📌 Fetch user by ID: ${id}`);
    const user = await this.usersService.findById(+id);
    this.logger.log(`✅ Found user: ${user.name} (ID: ${user.id})`);
    return { user };
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    this.logger.log(`📧 Fetch user by email: ${email}`);
    const user = await this.usersService.findByEmail(email);
    this.logger.log(`✅ Found user: ${user.name} (email: ${user.email})`);
    return { user };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    this.logger.log(`✏️ Update user ID: ${id} → ${JSON.stringify(updateDto)}`);
    const user = await this.usersService.update(+id, updateDto);
    this.logger.log(`✅ Updated user: ${user.name} (email: ${user.email})`);
    return { user };
  }

  @Patch(':id/password')
  async updatePassword(@Param('id') id: string, @Body() body: { newPassword: string }) {
    this.logger.log(`🔐 Reset password for user ID: ${id}`);
    if (!body?.newPassword) throw new NotFoundException('Missing new password');
    const user = await this.usersService.adminUpdatePassword(+id, body.newPassword);
    this.logger.log(`✅ Password reset for: ${user.name}`);
    return { user };
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    this.logger.log(`🔄 Update role of user ID: ${id} to ${role}`);
    if (!Object.values(Role).includes(role as Role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }
    const user = await this.usersService.updateRole(+id, role as Role);
    this.logger.log(`✅ Role updated to ${role} for user: ${user.name}`);
    return { user };
  }

  @Patch(':id/active')
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    if (typeof body?.isActive !== 'boolean') {
      throw new BadRequestException('isActive must be boolean');
    }
    const user = await this.usersService.setActive(id, body.isActive);
    return { user };
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    this.logger.log(`🗑️ Soft delete user ID: ${id}`);
    const result = await this.usersService.softDelete(+id);
    this.logger.log(`✅ User soft deleted`);
    return result;
  }

  @Put('restore/:id')
  async restore(@Param('id') id: string) {
    this.logger.log(`🕊️ Restore user ID: ${id}`);
    const result = await this.usersService.restore(+id);
    this.logger.log(`✅ User restored`);
    return result;
  }
}
