import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { from, lastValueFrom } from "rxjs";
import { tap } from "rxjs/operators";
import { Strategy } from "passport-twitter";
import { AuthService } from "../auth.service";
import { LoginType } from "../enums/login-type.enum";
import { IHandleSocialLogin } from "../interfaces/handle-social-login.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, "twitter") {
  constructor(private authService: AuthService,
              private configService: ConfigService) {
    super({
      consumerKey: configService.get("TWITTER_CLIENT_ID"),
      consumerSecret: configService.get("TWITTER_SECRET_ID"),
      callbackURL: configService.get("TWITTER_CALL_BACK_URI"),
      includeEmail: true
    });
  }

  async validate(accessToken: string,
                 tokenSecret: string, profileFields: any, done: any) {
    const { emails, id } = profileFields;
    const socialEmail = emails[0].value;
    const socialLoginHandlerPayload: IHandleSocialLogin = {
      socialId: id,
      socialEmail,
      profileFields,
      loginType: LoginType.TWITTER
    };

    const execution$ = from(this.authService.handleSocialLogin(socialLoginHandlerPayload)).pipe(
      tap(({ userData, accessToken, refreshToken }) => done(null, { userData, accessToken, refreshToken }))
    );

    return lastValueFrom(execution$);
  }
}
