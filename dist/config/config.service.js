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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let CustomConfigService = class CustomConfigService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    get databaseConfig() {
        return {
            host: this.configService.getOrThrow('DB_HOST'),
            port: this.configService.getOrThrow('DB_PORT'),
            username: this.configService.getOrThrow('DB_USERNAME'),
            password: this.configService.getOrThrow('DB_PASSWORD'),
            database: this.configService.getOrThrow('DB_DATABASE'),
        };
    }
    get redisConfig() {
        return {
            host: this.configService.getOrThrow('REDIS_HOST'),
            port: this.configService.getOrThrow('REDIS_PORT'),
            password: this.configService.getOrThrow('REDIS_PASSWORD'),
        };
    }
    get fileConfig() {
        const allowedFileTypes = this.configService.get('ALLOWED_FILE_TYPES') ?? 'jpg,jpeg,png,pdf';
        return {
            uploadDir: this.configService.get('UPLOAD_DIR') ?? 'uploads',
            maxFileSize: this.configService.get('MAX_FILE_SIZE') ?? 5 * 1024 * 1024,
            allowedFileTypes: allowedFileTypes.split(','),
        };
    }
    get serviceConfig() {
        return {
            port: this.configService.get('PORT') ?? 3200,
            environment: this.configService.get('NODE_ENV') ?? 'development',
        };
    }
};
exports.CustomConfigService = CustomConfigService;
exports.CustomConfigService = CustomConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CustomConfigService);
//# sourceMappingURL=config.service.js.map