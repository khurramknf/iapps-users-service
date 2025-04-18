export type Role = 'admin' | 'staff' | 'user';
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
