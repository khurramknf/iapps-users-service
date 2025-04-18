export declare class AppService {
    private users;
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
