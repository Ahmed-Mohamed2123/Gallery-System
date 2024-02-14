import {Injectable, UnauthorizedException} from "@nestjs/common";
import {concatMap, from, lastValueFrom, of, throwError} from "rxjs";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, ExtractJwt} from 'passport-jwt';
import {User} from "../../user/entities/user.entity";
import {UserService} from "../../user/services/user.service";
import {CONFIG} from "../../../config/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: CONFIG.JWT_OPTIONS.SECRET_KEY,
        });
    }

    async validate(payload: Record<string, any>) {
        const {email} = payload;
        const execution$ = from(this.userService.getUserByEmail(email)).pipe(
            concatMap((userData: User) => {
                if (!userData) {
                    return throwError(() => new UnauthorizedException('User Is Not Authorized'));
                }

                return of(userData);
            })
        )

        return lastValueFrom(execution$);
    }
}
