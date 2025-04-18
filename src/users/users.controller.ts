// services/users-service/backend/src/users/users.controller.ts
import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Put,
  Delete,
  Query,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';

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
