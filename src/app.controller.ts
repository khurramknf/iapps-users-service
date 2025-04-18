// services/users-service/backend/src/app.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @Get('users')
  getUsers() {
    return this.appService.getUsers();
  }

  @Get('users/email/:email')
  getUserByEmail(@Param('email') email: string) {
    return this.appService.getUserByEmail(email);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.appService.getUserById(id);
  }
}
