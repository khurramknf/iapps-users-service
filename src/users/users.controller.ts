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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from './entities/user.entity';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createDto: any) {
    this.logger.log(`Received create request: ${JSON.stringify(createDto)}`);
    const user = await this.usersService.create(createDto);
    this.logger.log(`Returning created user with ID: ${user.id}`);
    return { user };
  }

  @Get()
  async findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    this.logger.log(`Fetching users: page=${page}, search=${search}`);
    const data = await this.usersService.findAllPaginated(
      parseInt(page ?? '1'),
      parseInt(limit ?? '10'),
      search || ''
    );
    return data;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    this.logger.log(`Fetching user by ID: ${id}`);
    const user = await this.usersService.findById(+id);
    return { user };
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    this.logger.log(`Fetching user by email: ${email}`);
    const user = await this.usersService.findByEmail(email);
    return { user };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    this.logger.log(`Updating user ID: ${id} with data: ${JSON.stringify(updateDto)}`);
    const user = await this.usersService.update(+id, updateDto);
    return { user };
  }

  @Patch(':id/password')
  async updatePassword(@Param('id') id: string, @Body() body: { newPassword: string }) {
    this.logger.log(`🔐 Admin resetting password for user ID ${id}`);
    if (!body?.newPassword) throw new NotFoundException('Missing new password');
    const user = await this.usersService.adminUpdatePassword(+id, body.newPassword);
    return { user };
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    this.logger.log(`Admin updating role of user ID ${id} to ${role}`);

    if (!Object.values(Role).includes(role as Role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }
    return this.usersService.updateRole(+id, role as Role);
  }

  @Patch(':id/active')
  async updateActiveStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    this.logger.log(`Updating isActive status of user ${id} to ${isActive}`);
    return this.usersService.toggleActive(+id, isActive);
  }


  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    this.logger.log(`Soft deleting user ID: ${id}`);
    return this.usersService.softDelete(+id);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: string) {
    this.logger.log(`Restoring user ID: ${id}`);
    return this.usersService.restore(+id);
  }
}
