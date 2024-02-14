import {
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";

@Injectable()
export class UserAuthGuard extends AuthGuard("jwt") {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err, user) {
        if (!user || err) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
