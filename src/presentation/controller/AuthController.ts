import { Request, Response } from 'express';
import { LoginAdminUseCase } from '@/application/use-cases/Admin';

export class AuthController {
    constructor(
        private loginAdminUseCase: LoginAdminUseCase
    ) { }

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            const result = await this.loginAdminUseCase.execute({
                email,
                password
            });

            if (!result.success) {
                res.status(401).json({
                    success: false,
                    message: result.message
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    admin: result.admin
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}
