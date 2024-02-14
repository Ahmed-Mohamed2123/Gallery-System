import {
    BadRequestException,
    ConflictException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import {concatMap, from, lastValueFrom, map, Observable, of, throwError} from "rxjs";
import {tap} from "rxjs/operators";
import {DeleteResult, UpdateResult} from "typeorm";
import {Nodemailer, NodemailerDrivers} from "@crowdlinker/nestjs-mailer";
import {JwtService} from "@nestjs/jwt";
import {SentMessageInfo} from "nodemailer";
import {User} from "../user/entities/user.entity";
import {AuthCredentialsDto} from "./dtos/auth-credentials.dto";
import {CreateProfileDto} from "./dtos/create-profile.dto";
import {EmailVerification} from "./entities/email-verification.entity";
import {CONFIG} from "../../config/config";
import {LoginDto} from "./dtos/login.dto";
import {ProfileService} from "../profile/profile.service";
import {FavoriteService} from "../favorite/services/favorite/favorite.service";
import {FollowService} from "../follow/follow.service";
import {ForgottenPassword} from "./entities/forgotten-password.entity";
import {ResetPasswordDto} from "./dtos/reset-password.dto";
import {UserService} from "../user/services/user.service";
import {IHandleUserCreation} from "../user/interfaces/handle-user-creation.interface";
import {LoginType} from "./enums/login-type.enum";
import {Hash} from "./utils/hash";
import {EmailVerificationRepository} from "./repositories/email-verification.repository";
import {IRegisterSocialUser} from "../user/interfaces/register-social-user.interface";
import {DateUtil} from "../../shared/utils/date-util";
import {ICreateEmailVerification} from "./interfaces/create-email-verification.interface";
import {checkEmailValidity} from "./helpers/email-checker";
import {IValidateUserPassword} from "../user/interfaces/validate-user-password.interface";
import {IFilterEmailVerification} from "./interfaces/filter-email-verification.interface";
import {ForgottenPasswordRepository} from "./repositories/forgotten-password.repository";
import {ICreateForgottenPasswordToken} from "./interfaces/create-forgotten-password-token.interface";
import {generateRefreshToken} from "./helpers/token-generator";
import {IHandleSocialLogin} from "./interfaces/handle-social-login.interface";

@Injectable()
export class AuthService {

    constructor(private emailVerificationRepo: EmailVerificationRepository,
                private forgottenPasswordRepo: ForgottenPasswordRepository,
                private nodeMailerService: Nodemailer<NodemailerDrivers.SMTP>,
                private jwtService: JwtService,
                @Inject(forwardRef(() => ProfileService)) private profileService: ProfileService,
                private favoriteService: FavoriteService,
                private followerService: FollowService,
                private userService: UserService) {
    }

    public async signUp(authCredentialsDto: AuthCredentialsDto,
                        createProfileDto: CreateProfileDto): Promise<{ accessToken: string, refreshToken: string }> {
        const {username, password, email} = authCredentialsDto;
        const {lastname, gender, age, country, firstname} = createProfileDto;

        let userData: User;
        let salt: string;
        let encryptedPassword: string;
        let refreshToken: string;

        const isValidEmail = checkEmailValidity(email);
        if (!isValidEmail) {
            throw new BadRequestException("You have entered invalid email");
        }

        const checkEmailExistenceStream$ = () => concatMap(() =>
            from(this.userService.checkEmailExistence(email)).pipe(
                concatMap(isEmailExisting =>
                    isEmailExisting ?
                        throwError(() => new ConflictException(`Email ${email} is not available, please try another one`))
                        : of(true)
                )
            ));

        const generateSaltStream$ = () => concatMap(() => from(Hash.generateSalt(password, salt)).pipe(
            tap((foundSalt: string) => salt = foundSalt)
        ));
        const generateEncryptedPasswordStream$ = () => concatMap(() => from(Hash.generateEncryptedPassword(password, salt)).pipe(
            tap(foundEncryptedPassword => encryptedPassword = foundEncryptedPassword)
        ));

        const handleUserCreationStream$ = () => concatMap(() => {
            const handleUserCreationPayload: IHandleUserCreation = {
                ...(!!firstname && {firstname}),
                ...(!!lastname && {lastname}),
                ...(!!username && {username}),
                email,
                loginType: LoginType.NORMAL,
                isEmailVerified: false,
                gender,
                age,
                country,
                password: encryptedPassword,
                salt
            };

            return from(this.userService.handleUserCreation(handleUserCreationPayload)).pipe(
                tap(foundUserData => userData = foundUserData)
            );
        });

        const generateEmailVerificationTokenStream$ = () => concatMap(() => from(this.generateEmailVerificationToken(email)));
        const sendEmailVerificationRequestStream$ = () => concatMap(() => from(this.sendEmailVerificationRequest(email)));
        const generateRefreshTokenStream$ = () => concatMap(() => from(this.handleRefreshToken(userData.id)).pipe(
            tap((foundRefreshToken: string) => refreshToken = foundRefreshToken)
        ));


        const execution$ = of({}).pipe(
            checkEmailExistenceStream$(),
            generateSaltStream$(),
            generateEncryptedPasswordStream$(),
            handleUserCreationStream$(),
            generateEmailVerificationTokenStream$(),
            sendEmailVerificationRequestStream$(),
            generateRefreshTokenStream$(),
            map(() => {
                const payload = {email, sub: userData.id};
                const accessToken = this.jwtService.sign(payload);
                return {
                    refreshToken,
                    accessToken
                };
            })
        );

        return lastValueFrom(execution$);
    }

    public async handleSocialLogin(payload: IHandleSocialLogin) {
        const {socialEmail, socialId, loginType, profileFields} = payload;
        const userStream$ = from(this.userService.getUserByEmail(socialEmail));

        const execution$ = userStream$.pipe(
            concatMap((foundUser: User) => {
                if (foundUser) {
                    const userId = foundUser.id;
                    const payload = {email: socialEmail, sub: userId};
                    const accessToken = this.jwtService.sign(payload);

                    return from(this.handleRefreshToken(userId)).pipe(
                        map((refreshToken: string) => ({userData: foundUser, accessToken, refreshToken}))
                    );
                }

                const registerSocialUser: IRegisterSocialUser = {
                    ...profileFields,
                    loginType,
                    socialId
                };

                return from(this.registerSocialUser(registerSocialUser)).pipe(
                    map(({userData, accessToken, refreshToken}) => ({userData, accessToken, refreshToken}))
                );
            })
        );

        return lastValueFrom(execution$);
    }

    public handleSocialAuthCallback(
        request: Record<string, any>,
        response: Record<string, any>,
        socialProvider: string
    ): void {
        const accessToken: string = request.user.accessToken;
        const refreshToken: string = request.user.refreshToken;
        const {id} = request.user.userData;
        if (accessToken && refreshToken) {
            response.redirect(`http://localhost:4200/#/auth/${socialProvider}-success/userId:${id}/accessToken:${accessToken}/refreshToken:${refreshToken}`);
        } else {
            response.redirect(`http://localhost:4200/#/auth/${socialProvider}-failure`);
        }
    }

    public async registerSocialUser(registerSocialUser: IRegisterSocialUser): Promise<{ userData: User, accessToken: string, refreshToken: string }> {
        const {name, displayName, emails, username, photos, socialId, loginType} = registerSocialUser;
        const {givenName, familyName} = name;
        const socialEmail = emails[0].value;
        const profileImage = photos[0]?.value;
        let userData: User;
        let refreshToken: string;

        const checkEmailExistenceStream$ = () => concatMap(() =>
            from(this.userService.checkEmailExistence(socialEmail)).pipe(
                concatMap(isEmailExisting =>
                    isEmailExisting ?
                        throwError(() => new ConflictException(`Email ${socialEmail} is not available, please try another one`))
                        : of(true)
                )
            ));

        const handleSocialUserCreationStream$ = () => concatMap(() => {
            const handleUserCreationPayload: IHandleUserCreation = {
                firstname: givenName ?? null,
                lastname: familyName ?? null,
                username: !!displayName ? displayName : username,
                email: socialEmail,
                image: profileImage,
                socialId,
                loginType,
                isEmailVerified: false
            };

            return from(this.userService.handleUserCreation(handleUserCreationPayload)).pipe(
                tap(foundUserData => userData = foundUserData)
            );
        });

        const generateRefreshTokenStream$ = () => concatMap(() => from(this.handleRefreshToken(userData.id)).pipe(
            tap((foundRefreshToken: string) => refreshToken = foundRefreshToken)
        ));

        const execution$ = of({}).pipe(
            checkEmailExistenceStream$(),
            handleSocialUserCreationStream$(),
            generateRefreshTokenStream$(),
            map(() => {
                const payload = {email: socialEmail, sub: userData.id};
                const accessToken = this.jwtService.sign(payload);
                return {
                    userData,
                    accessToken,
                    refreshToken
                };
            })
        );

        return lastValueFrom(execution$);
    }

    public async login(emailLoginDto: LoginDto): Promise<{ accessToken: string, refreshToken: string }> {
        const {email, password} = emailLoginDto;
        let userData: User;

        const isValidEmail = checkEmailValidity(email);
        if (!isValidEmail) throw new BadRequestException("Invalid Email Signature");

        const validateUserPasswordStream$ = () => concatMap(() => {
            const payload: IValidateUserPassword = {
                email,
                password
            };

            return from(this.userService.validateUserPassword(payload));
        });

        const getUserDataStream$ = () => concatMap(() =>
            from(this.userService.getUserByEmail(email)).pipe(
                concatMap((user: User) =>
                    user ?
                        of(user) : throwError(() => new NotFoundException("User does not exist"))
                )
            ));

        const handleRefreshTokenStream$ = () => concatMap(() => from(this.handleRefreshToken(userData.id)));

        const execution$ = of({}).pipe(
            validateUserPasswordStream$(),
            getUserDataStream$(),
            handleRefreshTokenStream$(),
            map((refreshToken: string) => {
                const payload = {email, sub: userData.id};
                const accessToken = this.jwtService.sign(payload);

                return {
                    accessToken,
                    refreshToken
                };
            })
        );

        return lastValueFrom(execution$);
    }

    private async generateEmailVerificationToken(email: string) {
        const filterEmailVerification: IFilterEmailVerification = {
            email
        };

        const execution$ = from(this.emailVerificationRepo.getEmailVerificationData(filterEmailVerification)).pipe(
            concatMap(emailVerification => {
                const isEmailVerificationExpired = emailVerification &&
                    DateUtil.diff(new Date(), new Date(emailVerification.timestamp), "minutes") > 15;

                if (!isEmailVerificationExpired) {
                    return throwError(() => new HttpException("LOGIN_EMAIL_SENT_RECENTLY", HttpStatus.INTERNAL_SERVER_ERROR));
                }

                const emailToken = (Math.floor(Math.random() * (900000)) + 100000).toString();
                const createEmailVerificationPayload: ICreateEmailVerification = {
                    email,
                    emailToken,
                    timestamp: new Date()
                };

                return from(this.emailVerificationRepo.createEmailVerification(createEmailVerificationPayload));
            })
        );

        return lastValueFrom(execution$);
    }

    public async sendEmailVerificationRequest(email: string): Promise<SentMessageInfo> {
        const filterEmailVerification: IFilterEmailVerification = {
            email
        };

        const execution$ = from(this.emailVerificationRepo.getEmailVerificationData(filterEmailVerification)).pipe(
            concatMap((emailVerification: EmailVerification) => {
                if (!emailVerification && !emailVerification?.emailToken) {
                    return throwError(() => new HttpException("REGISTER.USER_NOT_REGISTERED", HttpStatus.FORBIDDEN));
                }

                const url = `<a style="text-decoration: none" href= "http://${CONFIG.FRONTEND_SETTINGS.URL}/#/${CONFIG.FRONTEND_SETTINGS.ENDPOINTS.VERIFY_EMAIL}/${emailVerification.emailToken}">Click Here To Confirm You Email</a>`;
                const sendMailPayload = {
                    from: "Ahmed-Shabana <ahmedshabana646@gmail.com>",
                    to: email,
                    subject: "Verify Email",
                    text: "Verify Email",
                    html: `Hi <br><br> <h3>Thanks for registration please verify your email How are you soma</h3>
                        ${url}`
                };

                return from(this.nodeMailerService.sendMail(sendMailPayload));
            })
        );

        return lastValueFrom(execution$);
    }

    public async verifyEmail(token: string): Promise<{ isFullyVerified: boolean, user: User }> {
        let userData: User;

        const emailVerificationDataStream$ = from(this.emailVerificationRepo.getEmailVerificationData({
            emailToken: token
        }));

        const getUserDataStream$ = (email: string) => concatMap(() => from(this.userService.getUserByEmail(email)).pipe(
            tap((foundUser: User) => userData = foundUser)
        ));

        const makeUserVerifiedStream$ = () => concatMap(() => from(this.userService.makeUserVerified(userData.id)));

        const deleteEmailVerificationStream$ = (emailVerificationId: string) => concatMap(() =>
            from(this.deleteEmailVerificationById(emailVerificationId)));

        const execution$ = emailVerificationDataStream$.pipe(
            concatMap((emailVerification: EmailVerification) => {
                const {emailToken, email} = emailVerification;
                if (!emailVerification || !emailToken) {
                    return throwError(() => new HttpException("LOGIN_EMAIL_CODE_NOT_VALID", HttpStatus.FORBIDDEN));
                }

                return of({}).pipe(
                    getUserDataStream$(email),
                    makeUserVerifiedStream$(),
                    deleteEmailVerificationStream$(emailVerification.id),
                    map(() => ({
                        isFullyVerified: true,
                        user: userData
                    }))
                );
            })
        );

        return lastValueFrom(execution$);
    }

    public async sendEmailForgottenPassword(email: string): Promise<any> {
        const emailExistenceCheckerStream$ = from(this.userService.checkEmailExistence(email)).pipe(
            concatMap((isUserExisting: boolean) => isUserExisting ?
                of(true) :
                throwError(() => new HttpException(`This user with email ${email} does not exist`, HttpStatus.NOT_FOUND))
            )
        );

        const createForgottenPasswordTokenStream$ = () => concatMap(() => from(this.createForgottenPasswordToken(email)));

        const execution$ = emailExistenceCheckerStream$.pipe(
            createForgottenPasswordTokenStream$(),
            concatMap((forgottenPasswordToken: ForgottenPassword) => {
                if (!forgottenPasswordToken || !forgottenPasswordToken?.newPasswordToken) {
                    return throwError(() => new HttpException("Forgotten password email token does not created successfully", HttpStatus.INTERNAL_SERVER_ERROR));
                }

                const url = `<a style="text-decoration:none;"
                        href= "http://${CONFIG.FRONTEND_SETTINGS.URL}/#/${CONFIG.FRONTEND_SETTINGS.ENDPOINTS.RESET_PASSWORD}/${forgottenPasswordToken.newPasswordToken}">Click here to reset your password</a>`;

                const payload = {
                    from: "Ahmed-Shabana <ahmedshabana646@gmail.com>",
                    to: email,
                    subject: "Reset Your Password",
                    text: "Reset Your Password",
                    html: `<h1>Hi User</h1> <br><br> <h2>You have requested to reset your password , please click the following link to change your password</h2>
                        <h3>Please click the following link</h3><br><br>
                        ${url}`
                };

                return from(this.nodeMailerService.sendMail(payload));
            })
        );

        return lastValueFrom(execution$);
    }

    private async createForgottenPasswordToken(email: string) {
        const forgottenPasswordTokenStream$ = from(this.forgottenPasswordRepo.getForgottenPasswordToken({email}));
        const execution$ = forgottenPasswordTokenStream$.pipe(
            concatMap(forgottenPasswordToken => {
                const isEmailVerificationExpired = forgottenPasswordToken &&
                    DateUtil.diff(new Date(), new Date(forgottenPasswordToken.timestamp), "minutes") > 15;
                if (!isEmailVerificationExpired) {
                    return throwError(() => new HttpException("RESET_PASSWORD_EMAIL_SENT_RECENTLY", HttpStatus.INTERNAL_SERVER_ERROR));
                }

                const passwordToken = (Math.floor(Math.random() * (900000)) + 100000).toString();
                const createForgottenPasswordTokenPayload: ICreateForgottenPasswordToken = {
                    email,
                    timestamp: new Date(),
                    newPasswordToken: passwordToken
                };

                return from(this.forgottenPasswordRepo.createForgottenPasswordToken(createForgottenPasswordTokenPayload));
            })
        );

        return lastValueFrom(execution$);
    }

    public async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const {email, newPasswordToken, currentPassword, newPassword} = resetPasswordDto;
        let isNewPasswordChanged = false;
        let encryptedPassword: string;
        let forgottenPassword: ForgottenPassword;
        let userData: User;
        let execution$: Observable<boolean | never>;

        const getUserDataStream$ = () => concatMap(() => from(this.userService.getUserByEmail(email)).pipe(
            concatMap(userData =>
                userData ?
                    of(userData) :
                    throwError(() => new NotFoundException(`This user does not exist`))
            ),
            tap(foundUserData => userData = foundUserData)
        ));
        const checkPasswordMatchStream$ = () => concatMap(() =>
            from(Hash.checkPasswordMatch(currentPassword, userData.password)).pipe(
                concatMap(isValidPassword =>
                    isValidPassword ?
                        of(true) :
                        throwError(() => new HttpException("RESET_PASSWORD_WRONG_CURRENT_PASSWORD", HttpStatus.CONFLICT))
                )
            )
        );
        const generateEncryptedPasswordStream$ = () => concatMap(() =>
            from(Hash.generateEncryptedPassword(newPassword, userData.salt)).pipe(
                tap(foundEncryptedPassword => encryptedPassword = foundEncryptedPassword)
            ));
        const editUserPasswordStream$ = () => concatMap(() =>
            from(this.userService.editUserPassword(!!forgottenPassword ? forgottenPassword.email : email, encryptedPassword)).pipe(
                concatMap((result: UpdateResult) => {
                    if (result.affected === 0) {
                        return throwError(() => new ConflictException("There may be an error in the data entered!"));
                    }

                    return of(true);
                }),
                tap(isPasswordChanged => isNewPasswordChanged = isPasswordChanged)
            )
        );

        const getForgottenPasswordTokenStream$ = () => concatMap(() =>
            from(this.forgottenPasswordRepo.getForgottenPasswordToken({newPasswordToken})).pipe(
                tap(foundForgottenPasswordToken => forgottenPassword = foundForgottenPasswordToken)
            ));
        const deleteForgottenPasswordTokenStream$ = () => concatMap(() =>
            from(this.deleteForgottenPasswordTokenById(forgottenPassword.id)));

        if (email && currentPassword) {
            execution$ = of({}).pipe(
                getUserDataStream$(),
                checkPasswordMatchStream$(),
                generateEncryptedPasswordStream$(),
                editUserPasswordStream$(),
                map(() => isNewPasswordChanged)
            );
        } else if (newPasswordToken) {
            execution$ = of({}).pipe(
                getForgottenPasswordTokenStream$(),
                generateEncryptedPasswordStream$(),
                editUserPasswordStream$(),
                deleteForgottenPasswordTokenStream$(),
                map(() => isNewPasswordChanged)
            );
        } else {
            execution$ = throwError(() => new HttpException("RESET_PASSWORD_CHANGE_PASSWORD_ERROR", HttpStatus.INTERNAL_SERVER_ERROR));
        }

        return lastValueFrom(execution$);
    }

    public async handleRefreshToken(userId: string): Promise<string> {
        const refreshToken = generateRefreshToken();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 6);

        const execution$ = from(this.userService.setRefreshToken(userId, refreshToken, expiryDate)).pipe(
            map(() => refreshToken)
        );

        return lastValueFrom(execution$);
    }

    private async deleteEmailVerificationById(id: string) {
        const execution$ = from(this.emailVerificationRepo.deleteEmailVerificationById(id)).pipe(
            concatMap((result: DeleteResult) => {
                if (result.affected === 0) {
                    return throwError(() => new NotFoundException(`Email verification with id ${id} does not found`));
                }

                return of(true);
            })
        );

        return lastValueFrom(execution$);
    }

    private async deleteForgottenPasswordTokenById(id: string) {
        const execution$ = from(this.forgottenPasswordRepo.deleteForgottenPasswordTokenById(id)).pipe(
            concatMap((result: DeleteResult) => {
                if (result.affected === 0) {
                    return throwError(() => new NotFoundException(`Forgotten password token with id ${id} does not found`));
                }

                return of(true);
            })
        );

        return lastValueFrom(execution$);
    }
}
