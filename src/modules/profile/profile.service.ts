import {forwardRef, Inject, Injectable, NotFoundException} from "@nestjs/common";
import {concatMap, from, lastValueFrom, map, of, throwError} from "rxjs";
import {tap} from "rxjs/operators";
import {Profile} from "./entities/profile.entity";
import {User} from "../user/entities/user.entity";
import {ImageProcessor} from "../../shared/utils/image-processor";
import {CreateProfileDto} from "../auth/dtos/create-profile.dto";
import {ProfileRepository} from "./repositories/profile.repository";
import {UserService} from "../user/services/user.service";
import {IGenerateCompositeImage} from "../../shared/interfaces/generate-composite-image.interface";
import {ImageInformationDto} from "../../shared/dtos/image-information.dto";
import {FileOperation} from "../../utils/file-operation";
import {ImagePath} from "../../shared/enums/image-path.enum";
import {generateRandomFilename} from "../../shared/helpers/file-name-generator";
import {CacheService} from "../../cache/services/cache.service";

@Injectable()
export class ProfileService {

    constructor(private profileRepo: ProfileRepository,
                @Inject(forwardRef(() => UserService)) private userService: UserService,
                private cacheService: CacheService) {
    }

    public async getProfileById(profileId: string): Promise<Profile> {
        const cacheKey = `${profileId}-profile`;
        const cachedProfileStream$ = from(this.cacheService.get<Profile>(cacheKey));
        const lookupStream$ = from(this.profileRepo.getProfileById(profileId)).pipe(
            concatMap((profileData: Profile) => {
                if (!profileData) {
                    return throwError(() => new NotFoundException("Profile does not found"));
                }

                return from(this.cacheService.set<Profile>(cacheKey, profileData));
            })
        );

        const execution$ = cachedProfileStream$.pipe(
            concatMap(cachedProfileData => cachedProfileData ? of(cachedProfileData) : lookupStream$)
        );

        return lastValueFrom(execution$);
    }

    public async getProfileByUserId(userId: string): Promise<Profile> {
        const userLookupStream$ = from(this.userService.getUserById(userId)).pipe(
            concatMap((userData: User) => userData ?
                of(userData) :
                throwError(() => new NotFoundException("user does not found"))
            )
        );
        const getProfileStream$ = () => concatMap((user: User) => from(this.getProfileById(user.profileId)));

        const execution$ = userLookupStream$.pipe(
            getProfileStream$()
        );

        return lastValueFrom(execution$);
    }

    public async changeProfileImage(
        user: User,
        selectedMainImageFile: Express.Multer.File,
        imageInformationDto: ImageInformationDto): Promise<Profile> {
        const {scale, mainImageWidth, mainImageHeight, offsetY, offsetX} = imageInformationDto;
        const selectedImagePath = selectedMainImageFile.path;
        let compositeImageUrl: string;
        let profile: Profile;

        const profileLookupStream$ = from(this.getProfileById(user.profileId)).pipe(
            tap((foundProfile: Profile) => profile = foundProfile)
        );

        const generateCompositeImageStream$ = () => concatMap(() => {
            const fileName = generateRandomFilename();
            const payload: IGenerateCompositeImage = {
                scale,
                mainImageWidth,
                mainImageHeight,
                backgroundImageWidth: 200,
                backgroundImageHeight: 200,
                offsetX,
                offsetY,
                selectedImagePath: selectedImagePath,
                modifiedImagePath: `${ImagePath.GALLERY_PHOTO}/${fileName}.jpeg`
            };

            return from(ImageProcessor.generateCompositeImage(payload)).pipe(
                tap(({imageUrl}) => compositeImageUrl = imageUrl)
            );
        });

        const deleteSelectedImageStream$ = () => concatMap(() => from(FileOperation.deleteFile(selectedImagePath)));

        const editProfileBackgroundImageStream$ = () => concatMap(() => {
            profile.image = compositeImageUrl;
            return from(profile.save());
        });

        const flushProfileCacheStream$ = () => concatMap(() =>
            from(this.cacheService.delete(`${profile.id}-profile`)));

        const execution$ = profileLookupStream$.pipe(
            generateCompositeImageStream$(),
            deleteSelectedImageStream$(),
            editProfileBackgroundImageStream$(),
            flushProfileCacheStream$(),
            map(() => profile)
        );

        return lastValueFrom(execution$);
    }

    public async changeProfileBackgroundImage(
        user: User,
        selectedBackgroundImageFile: Express.Multer.File,
        imageInformationDto: ImageInformationDto): Promise<Profile> {
        const {scale, mainImageWidth, mainImageHeight, offsetY, offsetX} = imageInformationDto;
        const selectedImagePath = selectedBackgroundImageFile.path;
        let compositeImageUrl: string;
        let profile: Profile;

        const profileLookupStream$ = from(this.getProfileById(user.profileId)).pipe(
            tap((foundProfile: Profile) => profile = foundProfile)
        );

        const generateCompositeImageStream$ = () => concatMap(() => {
            const fileName = generateRandomFilename();
            const payload: IGenerateCompositeImage = {
                scale,
                mainImageWidth,
                mainImageHeight,
                backgroundImageWidth: 1110,
                backgroundImageHeight: 340,
                offsetX,
                offsetY,
                selectedImagePath: selectedImagePath,
                modifiedImagePath: `${ImagePath.GALLERY_PHOTO}/${fileName}.jpeg`
            };

            return from(ImageProcessor.generateCompositeImage(payload)).pipe(
                tap(({imageUrl}) => compositeImageUrl = imageUrl)
            );
        });

        const deleteSelectedImageStream$ = () => concatMap(() => from(FileOperation.deleteFile(selectedImagePath)));

        const editProfileBackgroundImageStream$ = () => concatMap(() => {
            profile.backgroundImage = compositeImageUrl;
            return from(profile.save());
        });

        const flushProfileCacheStream$ = () => concatMap(() =>
            from(this.cacheService.delete(`${profile.id}-profile`)));

        const execution$ = profileLookupStream$.pipe(
            generateCompositeImageStream$(),
            deleteSelectedImageStream$(),
            editProfileBackgroundImageStream$(),
            flushProfileCacheStream$(),
            map(() => profile)
        );

        return lastValueFrom(execution$);
    }

    public async editProfile(user: User, createProfileDto: CreateProfileDto): Promise<Profile> {
        const {firstname, lastname, age, country, gender} = createProfileDto;
        let profile: Profile;

        const profileLookupStream$ = from(this.profileRepo.getProfileById(user.profileId)).pipe(
            concatMap((profile: Profile) => profile ?
                of(profile) : throwError(() => new NotFoundException("profile does not found"))
            ),
            tap((foundProfile: Profile) => profile = foundProfile)
        );

        const editProfileStream$ = () => concatMap(() => {
            if (firstname) profile.firstname = firstname;
            if (lastname) profile.lastname = lastname;
            if (age) profile.age = age;
            if (country) profile.country = country;
            if (gender) profile.gender = gender;

            return from(profile.save());
        });

        const flushProfileCacheStream$ = () => concatMap(() =>
            from(this.cacheService.delete(`${profile.id}-profile`)));

        const execution$ = profileLookupStream$.pipe(
            editProfileStream$(),
            flushProfileCacheStream$(),
            map(() => profile)
        );

        return lastValueFrom(execution$);
    }

}
