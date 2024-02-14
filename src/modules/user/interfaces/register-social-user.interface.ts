export interface IRegisterSocialUser {
    name?: {
        givenName?: string;
        familyName?: string
    };
    displayName?: string;
    username?: string;
    emails?: Record<string, any>;
    photos?: Record<string, any>;
    socialId?: string;
    loginType?: string;
}