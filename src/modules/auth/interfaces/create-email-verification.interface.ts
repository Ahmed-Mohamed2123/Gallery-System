export interface ICreateEmailVerification {
    email: string;
    emailToken: string;
    timestamp: Date;
}