export interface Admin {
    id: string;
    userName: string;
    email: string;
    password: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}
