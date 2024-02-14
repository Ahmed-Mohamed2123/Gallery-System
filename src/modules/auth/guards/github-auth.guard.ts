import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { SocialProvider } from "../enums/social-provider.enum";

@Injectable()
export class GithubAuthGuard extends AuthGuard("github") {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException(`${SocialProvider.GITHUB} authentication failed`);
    }
    return user;
  }
}