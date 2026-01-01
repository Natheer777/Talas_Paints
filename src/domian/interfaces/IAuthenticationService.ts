export interface IAuthenticationService {
    comparePassword(password: string, storedPassword: string): boolean;
}
