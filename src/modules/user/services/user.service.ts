import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { concatMap, forkJoin, from, lastValueFrom, map, of, throwError } from "rxjs";
import { tap } from "rxjs/operators";
import { UserRepository } from "../repositories/user.repository";
import { ICreateUser } from "../interfaces/create-user.interface";
import { User } from "../entities/user.entity";
import { ProfileService } from "../../profile/profile.service";
import { GalleryService } from "../../gallery/services/gallery.service";
import { FavoriteService } from "../../favorite/services/favorite/favorite.service";
import { IHandleUserCreation } from "../interfaces/handle-user-creation.interface";
import { Favorite } from "../../favorite/entities/favorite.entity";
import { Profile } from "../../profile/entities/profile.entity";
import { ICreateFavoriteList } from "../../favorite/interfaces/favorite/create-favorite-list.interface";
import { IValidateUserPassword } from "../interfaces/validate-user-password.interface";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository,
              @Inject(forwardRef(() => ProfileService)) private profileService: ProfileService,
              @Inject(forwardRef(() => GalleryService)) private galleryService: GalleryService,
              @Inject(forwardRef(() => FavoriteService)) private favoriteService: FavoriteService) {
  }

  public async getUserMainData(user: User): Promise<{ user: User, profile: Profile, favorite: Favorite }> {
    const execution$ = forkJoin([
      from(this.profileService.getProfileById(user.profileId)),
      from(this.favoriteService.getUserFavoriteList(user))
    ]).pipe(
      map(([profile, favorite]) => ({
        user,
        profile,
        favorite
      }))
    );

    return lastValueFrom(execution$);
  }

  public async getUserByEmail(email: string) {
    return this.userRepository.getUserByEmail(email);
  }

  public async getUserById(userId: string): Promise<User> {
    return this.userRepository.getUserById(userId);
  }

  public async createUser(createUser: ICreateUser) {
    return this.userRepository.createUser(createUser);
  }

  public async editUserPassword(email: string, newPassword: string) {
    return this.userRepository.createQueryBuilder("user")
      .update(User)
      .set({ password: newPassword })
      .where("email = :email", { email })
      .execute();
  }

  public async setRefreshToken(id: string, refreshToken: string, expiryDate: Date) {
    return this.userRepository.update(id, { refreshToken, refreshTokenExpires: expiryDate });
  }

  public async makeUserVerified(userId: string) {
    return this.userRepository.makeUserVerified(userId);
  }

  public async checkEmailExistence(email: string) {
    return this.userRepository.checkEmailExistence(email);
  }

  public async handleUserCreation(handleUserCreation: IHandleUserCreation) {
    const {
      username,
      firstname,
      lastname,
      image,
      email,
      socialId,
      loginType,
      isEmailVerified,
      salt,
      password
    } = handleUserCreation;

    let userData: User;

    const user = new User();
    if (!!username) user.username = username;
    user.email = email;
    if (!!password) user.password = password;
    if (!!salt) user.salt = email;
    if (!!socialId) user.socialId = socialId;
    user.loginType = loginType;
    user.isEmailVerified = isEmailVerified;

    const profile = new Profile();
    profile.user = user;
    if (!!firstname) profile.firstname = firstname;
    if (!!lastname) profile.lastname = lastname;
    if (!!image) profile.image = image;

    const createProfileFavoriteListStream$ = () => concatMap(() => {
      const createFavoriteListPayload: ICreateFavoriteList = {
        profile
      };

      return from(this.favoriteService.createFavoriteList(createFavoriteListPayload)).pipe(
        tap(profileFavoriteList => {
          profile.favorite = profileFavoriteList;
        })
      );
    });

    const createUserProfileStream$ = () => concatMap(() => {
      return from(profile.save()).pipe(
        tap((foundProfile: Profile) => {
          user.profile = foundProfile;
        })
      );
    });

    const createUserStream$ = () => concatMap(() => {
      return from(user.save()).pipe(
        tap((foundUser: User) => userData = foundUser)
      );
    });

    const execution$ = of({}).pipe(
      createProfileFavoriteListStream$(),
      createUserProfileStream$(),
      createUserStream$(),
      map(() => userData)
    );

    return lastValueFrom(execution$);
  }

  public async validateUserPassword(validateUserPassword: IValidateUserPassword): Promise<boolean> {
    const { email, password } = validateUserPassword;
    const userLookupStream$ = from(this.getUserByEmail(email)).pipe(
      concatMap((user: User) =>
        user ?
          of(user) : throwError(() => new NotFoundException("User does not exist"))
      )
    );

    const validatePasswordStream$ = () => concatMap((userData: User) => from(userData.validatePassword(password)).pipe(
      concatMap(isValidPassword =>
        isValidPassword ?
          of(true) :
          throwError(() => new BadRequestException("Your password is incorrect, please enter another password")))
    ));

    const execution$ = userLookupStream$.pipe(
      validatePasswordStream$()
    );

    return lastValueFrom(execution$);
  }
}