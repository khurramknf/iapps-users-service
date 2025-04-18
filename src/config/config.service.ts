// services/users-service/backend/src/config/config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  constructor(private readonly configService: ConfigService) {}

  get databaseConfig() {
    return {
      host: this.configService.getOrThrow<string>('DB_HOST'),
      port: this.configService.getOrThrow<number>('DB_PORT'),
      username: this.configService.getOrThrow<string>('DB_USERNAME'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      database: this.configService.getOrThrow<string>('DB_DATABASE'),
    };
  }

  get redisConfig() {
    return {
      host: this.configService.getOrThrow<string>('REDIS_HOST'),
      port: this.configService.getOrThrow<number>('REDIS_PORT'),
      password: this.configService.getOrThrow<string>('REDIS_PASSWORD'),
    };
  }

  get fileConfig() {
    const allowedFileTypes = this.configService.get<string>('ALLOWED_FILE_TYPES') ?? 'jpg,jpeg,png,pdf';
    return {
      uploadDir: this.configService.get<string>('UPLOAD_DIR') ?? 'uploads',
      maxFileSize: this.configService.get<number>('MAX_FILE_SIZE') ?? 5 * 1024 * 1024, // 5MB
      allowedFileTypes: allowedFileTypes.split(','),
    };
  }

  get serviceConfig() {
    return {
      port: this.configService.get<number>('PORT') ?? 3200,
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
    };
  }
} 