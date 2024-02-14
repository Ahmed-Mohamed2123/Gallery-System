import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { from, lastValueFrom } from "rxjs";
import { tap } from "rxjs/operators";
import { Strategy } from "passport-linkedin-oauth2";
import { AuthService } from "../auth.service";
import { LoginType } from "../enums/login-type.enum";
import { IHandleSocialLogin } from "../interfaces/handle-social-login.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, "linkedin") {
  constructor(private authService: AuthService,
              private configService: ConfigService) {
    super({
      clientID: configService.get("LINKEDIN_CLIENT_ID"),
      clientSecret: configService.get("LINKEDIN_SECRET_ID"),
      callbackURL: configService.get("LINKEDIN_CALL_BACK_URI"),
      scope: ["r_emailaddress", "r_liteprofile"]
    });
  }

  public async validate(accessToken: string,
                        refreshToken: string, profileFields: Record<string, any>, done: any) {
    const { emails, id } = profileFields;
    const socialEmail = emails[0].value;

    const socialLoginHandlerPayload: IHandleSocialLogin = {
      socialId: id,
      socialEmail,
      profileFields,
      loginType: LoginType.LINKEDIN
    };

    const execution$ = from(this.authService.handleSocialLogin(socialLoginHandlerPayload)).pipe(
      tap(({ userData, accessToken, refreshToken }) => done(null, { userData, accessToken, refreshToken }))
    );

    return lastValueFrom(execution$);
  }
}
