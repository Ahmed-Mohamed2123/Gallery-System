import {
  Body,
  Controller,
  Get,
  Post, Req, Res,
  UseGuards
} from "@nestjs/common";
import { ApiBody, ApiSecurity } from "@nestjs/swagger";
import { AuthCredentialsDto } from "./dtos/auth-credentials.dto";
import { CreateProfileDto } from "./dtos/create-profile.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { SocialProvider } from "./enums/social-provider.enum";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { GithubAuthGuard } from "./guards/github-auth.guard";
import { LinkedinAuthGuard } from "./guards/linkedin-auth.guard";
import { TwitterAuthGuard } from "./guards/twitter-auth.guard";
import { FacebookAuthGuard } from "./guards/facebook-auth.guard";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";

@ApiSecurity("API-KEY")
@Controller("auth")
export class AuthController {

  constructor(private authService: AuthService) {
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  handleGoogleLogin() {

  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  handleGoogleAuthCallback(@Req() req, @Res() res) {
    return this.authService.handleSocialAuthCallback(req, res, SocialProvider.GOOGLE);
  }

  @Get("facebook")
  @UseGuards(FacebookAuthGuard)
  handleFacebookLogin() {

  }

  @Get("facebook/callback")
  @UseGuards(FacebookAuthGuard)
  handleFacebookAuthCallback(@Req() req, @Res() res) {
    return this.authService.handleSocialAuthCallback(req, res, SocialProvider.FACEBOOK);
  }

  @Get("github")
  @UseGuards(GithubAuthGuard)
  handleGithubLogin() {

  }

  @Get("github/callback")
  @UseGuards(GithubAuthGuard)
  handleGithubAuthCallback(@Req() req, @Res() res) {
    return this.authService.handleSocialAuthCallback(req, res, SocialProvider.GITHUB);
  }

  @Get("linkedin")
  @UseGuards(LinkedinAuthGuard)
  handleLinkedInLogin() {

  }

  @Get("linkedin/callback")
  @UseGuards(LinkedinAuthGuard)
  handleLinkedInAuthCallback(@Req() req, @Res() res) {
    return this.authService.handleSocialAuthCallback(req, res, SocialProvider.LINKEDIN);
  }

  @Get("twitter")
  @UseGuards(TwitterAuthGuard)
  handleTwitterInLogin() {

  }

  @Get("twitter/callback")
  @UseGuards(TwitterAuthGuard)
  handleTwitterInAuthCallback(@Req() req, @Res() res) {
    return this.authService.handleSocialAuthCallback(req, res, SocialProvider.TWITTER);
  }

  @ApiBody({ type: AuthCredentialsDto, required: true })
  @ApiBody({ type: CreateProfileDto })
  @Post("register")
  signUp(@Body("authCredentialsDto") authCredentialsDto: AuthCredentialsDto,
         @Body("createProfileDto") createProfileDto: CreateProfileDto) {
    return this.authService.signUp(authCredentialsDto, createProfileDto);
  }

  @ApiBody({ schema: { type: "object", properties: { email: { type: "string" } }, required: ["email"] } })
  @Post("send-email-verification")
  sendEmailVerification(@Body("email") email: string) {
    return this.authService.sendEmailVerificationRequest(email);
  }

  @ApiBody({ schema: { type: "object", properties: { emailToken: { type: "string" } }, required: ["emailToken"] } })
  @Post("verify")
  verifyEmail(@Body("emailToken") token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiBody({ type: LoginDto, required: true })
  @Post("login")
  singInUser(@Body() emailLoginDto: LoginDto) {
    return this.authService.login(emailLoginDto);
  }

  @ApiBody({ schema: { type: "object", properties: { userId: { type: "string" } }, required: ["userId"] } })
  @Post("generate-refresh-token")
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@Req() req) {
    const userId = req.user.userData.id;
    return this.authService.handleRefreshToken(userId);
  }

  @ApiBody({ schema: { type: "object", properties: { email: { type: "string" } }, required: ["email"] } })
  @Post("forgot-password")
  sendEmailForgotPassword(@Body("email") email: string) {
    return this.authService.sendEmailForgottenPassword(email);
  }

  @ApiBody({ type: ResetPasswordDto, required: true })
  @Post("reset-password")
  setNewPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}