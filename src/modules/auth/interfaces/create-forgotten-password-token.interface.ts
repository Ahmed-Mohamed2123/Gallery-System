export interface ICreateForgottenPasswordToken {
    newPasswordToken: string;
    email: string;
    timestamp: Date;
}