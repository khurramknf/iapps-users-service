import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHealth(): {
        status: string;
    };
    getUsers(): {
        id: string;
        email: string;
        name: string;
    }[];
    getUserByEmail(email: string): {
        user: {
            id: string;
            email: string;
            name: string;
        };
    };
    getUserById(id: string): {
        user: {
            id: string;
            email: string;
            name: string;
        };
    };
}
