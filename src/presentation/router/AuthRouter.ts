import { Router } from 'express';
import { AuthController } from '../controller/AuthController';

export function createAuthRouter(authController: AuthController): Router {
    const router = Router();

    /**
     * @route   POST /api/auth/login
     * @desc    Admin login
     * @access  Public
     */
    router.post('/auth/login', authController.login);

    return router;
}
