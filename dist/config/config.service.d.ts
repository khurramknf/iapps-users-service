import { ConfigService } from '@nestjs/config';
export declare class CustomConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    get databaseConfig(): {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    get redisConfig(): {
        host: string;
        port: number;
        password: string;
    };
    get fileConfig(): {
        uploadDir: string;
        maxFileSize: number;
        allowedFileTypes: string[];
    };
    get serviceConfig(): {
        port: number;
        environment: string;
    };
}
