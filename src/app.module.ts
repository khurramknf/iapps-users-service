// File: services/users-service/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    // ✅ Load environment variables from `.env`
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env', // explicitly point to `.env`
    }),

    // ✅ TypeORM config using values from ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [User],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
