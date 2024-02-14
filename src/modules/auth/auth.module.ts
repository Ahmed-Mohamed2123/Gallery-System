import {forwardRef, Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {JwtStrategy} from "./stratigies/jwt.strategy";
import {AuthService} from "./auth.service";
import {AuthController} from "./auth.controller";
import {ProfileModule} from "../profile/profile.module";
import {FavoriteModule} from "../favorite/favorite.module";
import {RoomChatModule} from "../room-chat/room-chat.module";
import {FollowModule} from "../follow/follow.module";
import {GoogleStrategy} from "./stratigies/google.strategy";
import {FacebookStrategy} from "./stratigies/facebook.strategy";
import {GithubStrategy} from "./stratigies/github.strategy";
import {LinkedinStrategy} from "./stratigies/linkedin.strategy";
import {TwitterStrategy} from "./stratigies/twitter.strategy";
import {RefreshTokenStrategy} from "./stratigies/refresh-token.strategy";
import {UserModule} from "../user/user.module";
import {EmailVerificationRepository} from "./repositories/email-verification.repository";
import {ForgottenPasswordRepository} from "./repositories/forgotten-password.repository";
import {EmailVerification} from "./entities/email-verification.entity";
import {ForgottenPassword} from "./entities/forgotten-password.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import {CONFIG} from "../../config/config";

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: "jwt"
        }),
        JwtModule.register({
            secret: CONFIG.JWT_OPTIONS.SECRET_KEY,
            signOptions: {
                expiresIn: CONFIG.JWT_OPTIONS.SIGN_OPTIONS.EXPIRES_IN
            }
        }),
        ConfigModule,
        TypeOrmModule.forFeature([EmailVerification, ForgottenPassword]),
        forwardRef(() => ProfileModule),
        FavoriteModule,
        RoomChatModule,
        FollowModule,
        UserModule
    ],
    providers: [
        JwtStrategy,
        RefreshTokenStrategy,
        GoogleStrategy,
        FacebookStrategy,
        GithubStrategy,
        LinkedinStrategy,
        TwitterStrategy,
        AuthService,
        EmailVerificationRepository,
        ForgottenPasswordRepository
    ],
    controllers: [
        AuthController
    ],
    exports: [
        JwtStrategy,
        RefreshTokenStrategy,
        JwtModule,
        GoogleStrategy,
        FacebookStrategy,
        GithubStrategy,
        LinkedinStrategy,
        TwitterStrategy,
        PassportModule,
        AuthService
    ]
})
export class AuthModule {
}
