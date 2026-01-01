import { IAuthenticationService } from '@/domian/interfaces/IAuthenticationService';

export class AuthenticationService implements IAuthenticationService {
    comparePassword(password: string, storedPassword: string): boolean {
        // Simple plain text comparison as requested
        return password === storedPassword;
    }
}
