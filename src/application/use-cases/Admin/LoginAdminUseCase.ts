import { IAdminRepository } from '@/domian/repository/IAdminRepository';
import { IAuthenticationService } from '@/domian/interfaces/IAuthenticationService';

export interface LoginAdminDTO {
    email: string;
    password: string;
}

export interface LoginAdminResponse {
    success: boolean;
    admin?: {
        id: number;
        email: string;
    };
    message?: string;
}

export class LoginAdminUseCase {
    constructor(
        private adminRepository: IAdminRepository,
        private authService: IAuthenticationService
    ) { }

    async execute(dto: LoginAdminDTO): Promise<LoginAdminResponse> {
        if (!dto.email || !dto.password) {
            return {
                success: false,
                message: 'Email and password are required'
            };
        }

        const admin = await this.adminRepository.findByEmail(dto.email);

        if (!admin) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }

        const isPasswordValid = this.authService.comparePassword(
            dto.password,
            admin.password
        );

        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }

        return {
            success: true,
            admin: {
                id: admin.id,
                email: admin.email
            }
        };
    }
}
