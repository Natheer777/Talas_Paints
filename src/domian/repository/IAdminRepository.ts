import { Admin } from "../entities/Admin";

export interface IAdminRepository {
    findByEmail(email: string): Promise<Admin | null>;
    create(admin: Omit<Admin, 'id'>): Promise<Admin>;
    findAll(): Promise<Admin[]>;
}
