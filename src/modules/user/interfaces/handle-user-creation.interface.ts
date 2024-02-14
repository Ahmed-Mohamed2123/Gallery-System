export interface IHandleUserCreation {
  firstname?: string;
  lastname?: string;
  username?: string;
  email: string;
  image?: string;
  socialId?: string;
  loginType: string;
  isEmailVerified: boolean;
  gender?: string;
  age?: number;
  country?: string;
  password?: string;
  salt?: string;
}