export interface IHandleSocialLogin {
  socialEmail: string;
  socialId: string;
  loginType: string;
  profileFields: Record<string, any>;
}