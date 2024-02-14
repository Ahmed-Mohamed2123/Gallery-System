import {Injectable, UnauthorizedException} from "@nestjs/common";
import {concatMap, from, lastValueFrom, of, throwError} from "rxjs";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, ExtractJwt} from "passport-jwt";
import {User} from "../../user/entities/user.entity";
import {UserService} from "../../user/services/user.service";
import {CONFIG} from "../../../config/config";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "refresh-token") {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField("accessToken"),
            ignoreExpiration: true,
            secretOrKey: CONFIG.JWT_OPTIONS.SECRET_KEY,
            passReqToCallback: true
        });
    }

    async validate(request: Record<string, any>, payload: Record<string, any>) {
        const {email} = payload;
        const {refreshToken} = request.body;

        const execution$ = from(this.userService.getUserByEmail(email)).pipe(
            concatMap((userData: User) => {
                if (!userData) {
                    return throwError(() => new UnauthorizedException());
                } else if (userData.refreshToken !== refreshToken) {
                    return throwError(() => new UnauthorizedException());
                } else if (new Date() > new Date(userData.refreshTokenExpires)) {
                    throw new UnauthorizedException();
                }

                return of(userData);
            })
        );

        return lastValueFrom(execution$);
    }
}
