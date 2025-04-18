// services/users-service/backend/src/app.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AppService {
  private users = [
    {
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    }
  ];

  getUsers() {
    return this.users;
  }

  getUserByEmail(email: string) {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user };
  }

  getUserById(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user };
  }
}
