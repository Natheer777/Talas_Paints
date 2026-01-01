import { Request, Response, NextFunction } from 'express';
import { IAdminRepository } from '@/domian/repository/IAdminRepository';
import { IAuthenticationService } from '@/domian/interfaces/IAuthenticationService';

export class AuthMiddleware {
    constructor(
        private adminRepository: IAdminRepository,
        private authService: IAuthenticationService
    ) { }

    handle() {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const email = req.headers['admin-email'] as string;
                const password = req.headers['admin-password'] as string;

                if (!email || !password) {
                    res.status(401).json({
                        success: false,
                        message: 'Admin credentials required in headers (admin-email, admin-password)'
                    });
                    return;
                }

                const admin = await this.adminRepository.findByEmail(email);

                if (!admin || !this.authService.comparePassword(password, admin.password)) {
                    res.status(403).json({
                        success: false,
                        message: 'Invalid admin credentials. Access denied.'
                    });
                    return;
                }

                // Attach admin info to request
                (req as any).admin = {
                    id: admin.id,
                    email: admin.email
                };

                next();
            } catch (error) {
                console.error('Auth middleware error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error during authentication'
                });
            }
        };
    }
}
