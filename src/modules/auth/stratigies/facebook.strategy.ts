import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { from, lastValueFrom } from "rxjs";
import { tap } from "rxjs/operators";
import { Strategy } from "passport-facebook";
import { AuthService } from "../auth.service";
import { LoginType } from "../enums/login-type.enum";
import { IHandleSocialLogin } from "../interfaces/handle-social-login.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {
    super({
      clientID: configService.get("FACEBOOK_CLIENT_ID"),
      clientSecret: configService.get("FACEBOOK_SECRET_ID"),
      callbackURL: configService.get("FACEBOOK_CALL_BACK_URI"),
      scope: ["email"],
      profileFields: ["id", "displayName", "email", "photos", "name"]
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profileFields: Record<string, any>,
    done: any
  ) {
    const { emails, id } = profileFields;
    const socialEmail = emails[0].value;
    const socialLoginHandlerPayload: IHandleSocialLogin = {
      socialId: id,
      socialEmail,
      profileFields,
      loginType: LoginType.FACEBOOK
    };

    const execution$ = from(this.authService.handleSocialLogin(socialLoginHandlerPayload)).pipe(
      tap(({ userData, accessToken, refreshToken }) => done(null, { userData, accessToken, refreshToken }))
    );

    return lastValueFrom(execution$);
  }
}
