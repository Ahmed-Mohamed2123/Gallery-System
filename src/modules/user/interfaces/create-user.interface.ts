export interface ICreateUser {
    id: string;
    username: string;
    password: string;
    email: string;
    salt: string;
    isEmailVerified: boolean;
    refreshToken:string;
    refreshTokenExpires:string;
}