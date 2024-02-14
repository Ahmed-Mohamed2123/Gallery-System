import {forwardRef, Inject, Injectable, NotFoundException} from "@nestjs/common";
import {concatMap, forkJoin, from, lastValueFrom, map, of, throwError} from "rxjs";
import {tap} from "rxjs/operators";
import Jimp from "jimp";
import {DeleteResult} from "typeorm";
import {GalleryPhotoRepository} from "../repositories/gallery-photo.repository";
import {GalleryPhoto} from "../entities/gallery-photo.entity";
import {CONFIG} from "../../../config/config";
import {IGetGalleryPhoto} from "../interfaces/gallery-photo/get-gallery-photo.interface";
import {GetUserGalleryPhotoDto} from "../dtos/gallery-photo/get-user-gallery-photo.dto";
import {IGetUserPhoto} from "../interfaces/gallery-photo/get-user-photo.interface";
import {ResizeGalleryPhotoDto} from "../dtos/gallery-photo/resize-gallery-photo.dto";
import {JimpUtil} from "../../../shared/utils/jimp-util";
import {FileOperation} from "../../../utils/file-operation";
import {extractImagePath} from "../../../shared/helpers/image-path-extractor";
import {IGenerateCompositeImage} from "../../../shared/interfaces/generate-composite-image.interface";
import {ImageProcessor} from "../../../shared/utils/image-processor";
import {UpdateGalleryPhotoDto} from "../dtos/gallery-photo/update-gallery-photo.dto";
import {CreateGalleryPhotoDto} from "../dtos/gallery-photo/create-gallery-photo.dto";
import {ICreateGalleryPhoto} from "../interfaces/gallery-photo/create-gallery-photo.interface";
import {ImageInformationDto} from "../../../shared/dtos/image-information.dto";
import {FollowService} from "../../follow/follow.service";
import {NotificationService} from "../../notification/notification.service";
import {ICreateNotification} from "../../notification/interfaces/create-notification.interface";
import {UserService} from "../../user/services/user.service";
import {User} from "../../user/entities/user.entity";
import {Follow} from "../../follow/entities/follow.entity";
import {
    UserSubscriptionDetailService
} from "../../user/services/user-subscription-detail.service";
import {WebPushUtil} from "../../../shared/utils/web-push-util";
import {UserSubscriptionDetail} from "../../user/entities/user-subscription-detail.entity";
import {ISubscriptionDetail} from "../../../shared/interfaces/subscription-detail.interface";
import {INotificationData} from "../../../shared/interfaces/notification-data.interface";
import {GlobalEventsGateway} from "../../../gateways/global-events.gateway";
import {IFilterPhotoCount} from "../interfaces/gallery-photo/filter-photo-count.interface";
import {GetGalleryPhotoDto} from "../dtos/gallery-photo/get-gallery-photo.dto";
import {ImagePath} from "../../../shared/enums/image-path.enum";
import {generateRandomFilename} from "../../../shared/helpers/file-name-generator";
import {ObjectParser} from "../../../shared/utils/object-parser";

@Injectable()
export class GalleryPhotoService {

    constructor(private galleryPhotoRepository: GalleryPhotoRepository,
                private followerService: FollowService,
                private notificationService: NotificationService,
                private userService: UserService,
                @Inject(forwardRef(() => UserSubscriptionDetailService)) private userSubscriptionDetailsService: UserSubscriptionDetailService,
                private globalEventsGateway: GlobalEventsGateway) {
    }

    public async getGalleryPhotos(getGalleryPhotoDto: GetGalleryPhotoDto) {
        const {limit, page, galleryId} = getGalleryPhotoDto;
        let galleryPhotosCount: number;
        let galleryPhotos: GalleryPhoto[];

        const photosCountPayload: IFilterPhotoCount = {
            galleryId
        };

        const galleryPhotosCountStream$ = from(this.galleryPhotoRepository.getPhotosCount(photosCountPayload)).pipe(
            tap((foundGalleryPhotosCount: number) => galleryPhotosCount = foundGalleryPhotosCount)
        );
        const getGalleryPhotosStream$ = () => concatMap(() => {
            const payload: IGetGalleryPhoto = {
                limit, page, galleryId
            };
            return from(this.galleryPhotoRepository.getGalleryPhotos(payload)).pipe(
                tap((foundGalleryPhotos: GalleryPhoto[]) => galleryPhotos = foundGalleryPhotos)
            );
        });

        const execution$ = galleryPhotosCountStream$.pipe(
            getGalleryPhotosStream$(),
            map(() => ({
                galleryPhotosCount,
                galleryPhotos,
                page,
                limit
            }))
        );

        return lastValueFrom(execution$);
    }

    public async getUserGalleriesPhotos(getUserGalleryPhotoDto: GetUserGalleryPhotoDto) {
        const {limit, page, userId} = getUserGalleryPhotoDto;
        let userGalleriesPhotosCount: number;
        let userGalleriesPhotos: GalleryPhoto[];

        const photosCountPayload: IFilterPhotoCount = {
            userId
        };

        const galleriesPhotosCountStream$ = from(this.galleryPhotoRepository.getPhotosCount(photosCountPayload)).pipe(
            tap((foundUserPhotosCount: number) => userGalleriesPhotosCount = foundUserPhotosCount)
        );
        const getUserGalleriesPhotosStream$ = () => concatMap(() => {
            const payload: IGetUserPhoto = {
                limit, page, userId
            };

            return from(this.galleryPhotoRepository.getUserPhotos(payload)).pipe(
                tap((foundUserGalleryPhotos: GalleryPhoto[]) => userGalleriesPhotos = foundUserGalleryPhotos)
            );
        });

        const execution$ = galleriesPhotosCountStream$.pipe(
            getUserGalleriesPhotosStream$(),
            map(() => ({
                userGalleriesPhotosCount,
                userGalleriesPhotos,
                page,
                limit
            }))
        );

        return lastValueFrom(execution$);
    }

    public async getGalleryPhotoById(photoId: string): Promise<GalleryPhoto> {
        return this.galleryPhotoRepository.getGalleryPhotoById(photoId);
    }

    public async createGalleryPhotoInformation(
        createGalleryPhotoDto: CreateGalleryPhotoDto
    ) {
        const {userId, name, information} = createGalleryPhotoDto;

        const userLookupStream$ = from(this.userService.getUserById(userId)).pipe(
            concatMap((foundUser: User) =>
                foundUser ? of(foundUser) : throwError(() => new NotFoundException())
            )
        );

        const createGalleryPhotoStream$ = () => concatMap(() => {
            const payload: ICreateGalleryPhoto = {
                name,
                information
            };

            return from(this.galleryPhotoRepository.createGalleryPhoto(payload));
        });


        const execution$ = userLookupStream$.pipe(
            createGalleryPhotoStream$()
        );

        return lastValueFrom(execution$);

    }

    public async uploadGalleryPhoto(
        galleryPhotoId: string,
        selectedImageFile: Express.Multer.File,
        imageInformationDto: ImageInformationDto
    ) {
        const {
            scale,
            mainImageHeight,
            mainImageWidth,
            offsetX,
            offsetY
        } = ObjectParser.parseValuesToFloat(imageInformationDto);
        const selectedImagePath = selectedImageFile.path;
        const fileName = generateRandomFilename();
        const compositeImageUrl: string = `${ImagePath.GALLERY_PHOTO}/${fileName}.jpeg`;
        let notificationData: { title: string; body: string };
        let userSubscriptionDetails: UserSubscriptionDetail;
        let galleryPhoto: GalleryPhoto;
        let userData: User;

        const galleryPhotoLookupStream$ = from(this.galleryPhotoRepository.getGalleryPhotoById(galleryPhotoId)).pipe(
            concatMap((galleryPhoto: GalleryPhoto) =>
                galleryPhoto ?
                    of(galleryPhoto) : throwError(() => new NotFoundException("Gallery Photo does not found!!!"))
            ),
            tap((foundGalleryPhoto: GalleryPhoto) => {
                const {user} = galleryPhoto;
                galleryPhoto = foundGalleryPhoto;
                userData = user;
            })
        );

        const generateCompositeImageStream$ = () => concatMap(() => {
            const payload: IGenerateCompositeImage = {
                scale,
                mainImageWidth,
                mainImageHeight,
                backgroundImageWidth: 446,
                backgroundImageHeight: 600,
                offsetX,
                offsetY,
                selectedImagePath: selectedImagePath,
                modifiedImagePath: compositeImageUrl
            };

            return from(ImageProcessor.generateCompositeImage(payload));
        });

        const deleteSelectedImageStream$ = () => concatMap(() => from(FileOperation.deleteFile(selectedImagePath)));

        const setGalleryPhotoStream$ = () => concatMap(() => {
            return from(this.galleryPhotoRepository.setGalleryPhotoUrl(galleryPhotoId, compositeImageUrl));
        });

        const createNotificationStream$ = (followerUserData: User) => concatMap(() => {
            notificationData = {
                title: "Gallery Photo",
                body: `${followerUserData.username} added a new photo.`
            };

            const payload: ICreateNotification = {
                title: notificationData.title,
                content: notificationData.body,
                user: followerUserData
            };

            return from(this.notificationService.createNotification(payload));
        });

        const getUserFollowersStream$ = () => concatMap(() => from(this.followerService.getUserFollowers(userData.id)));
        const getUserSubscriptionDetailsStream$ = (userId: string) => concatMap(() =>
            from(this.userSubscriptionDetailsService.getUserSubscriptionDetails(userId)).pipe(
                tap((foundUserSubscriptionDetails: UserSubscriptionDetail) => userSubscriptionDetails = foundUserSubscriptionDetails)
            )
        );

        const sendWebPushNotificationStream$ = () => concatMap(() => {
            if (!userSubscriptionDetails) of(null);

            const {endpoint, keys} = userSubscriptionDetails;
            const subscriptionDetailPayload: ISubscriptionDetail = {
                endpoint,
                keys: {
                    auth: keys["auth"],
                    p256dh: keys["p256dh"]
                },
                user: userData
            };

            const notificationPayload: INotificationData = {
                notification: {
                    ...notificationData,
                    icon: "sd"
                }
            };

            WebPushUtil.configureWebPush();
            return from(WebPushUtil.sendWebPushNotification(subscriptionDetailPayload, notificationPayload));
        });

        const sendSocketNotificationStream$ = (userId: string) => tap(() => {
            this.globalEventsGateway.emitEvent(`${userId}-notification`, notificationData);
        });

        const handleNotificationStream$ = () => concatMap(() => {
            return of({}).pipe(
                getUserFollowersStream$(),
                concatMap((followers: Follow[]) => {
                    const areFollowersExisting = followers.length > 0;
                    if (!areFollowersExisting) return of(null);

                    const streams$ = followers.map((follower => {
                        const followerUserId = follower.followerUserId;
                        const followerUser = follower.followerUser;
                        return of({}).pipe(
                            createNotificationStream$(followerUser),
                            getUserSubscriptionDetailsStream$(followerUserId),
                            sendWebPushNotificationStream$(),
                            sendSocketNotificationStream$(followerUserId)
                        );
                    }));

                    return forkJoin(streams$);
                })
            );
        });

        const execution$ = galleryPhotoLookupStream$.pipe(
            generateCompositeImageStream$(),
            deleteSelectedImageStream$(),
            setGalleryPhotoStream$(),
            handleNotificationStream$(),
            map(() => ({
                success: true
            }))
        );

        return lastValueFrom(execution$);
    }

    public async updateGalleryPhotoInformation(updateGalleryPhotoDto: UpdateGalleryPhotoDto) {
        const {
            name,
            galleryPhotoId,
            information
        } = updateGalleryPhotoDto;
        let galleryPhoto: GalleryPhoto;

        const galleryPhotoLookupStream$ = from(this.getGalleryPhotoById(galleryPhotoId)).pipe(
            concatMap((galleryPhotoData: GalleryPhoto) => galleryPhotoData ?
                of(galleryPhotoData) :
                throwError(() => new NotFoundException("Gallery Photo Information does not found"))
            ),
            tap((foundGalleryPhoto: GalleryPhoto) => galleryPhoto = foundGalleryPhoto)
        );

        const updateGalleryPhotoStream$ = () => concatMap(() => {
            if (name) galleryPhoto.name = name;
            if (information) galleryPhoto.information = information;

            return from(galleryPhoto.save());
        });

        const execution$ = galleryPhotoLookupStream$.pipe(
            updateGalleryPhotoStream$()
        );

        return lastValueFrom(execution$);
    }

    public async updateGalleryPhoto(
        galleryPhotoId: string,
        selectedImageFile: Express.Multer.File,
        imageInformationDto: ImageInformationDto
    ): Promise<GalleryPhoto> {
        const {
            scale,
            mainImageHeight,
            mainImageWidth,
            offsetX,
            offsetY
        } = ObjectParser.parseValuesToFloat(imageInformationDto);
        const selectedImagePath = selectedImageFile.path;
        const fileName = generateRandomFilename();
        const compositeImageUrl: string = `${ImagePath.GALLERY_PHOTO}/${fileName}.jpeg`;
        let galleryPhoto: GalleryPhoto;

        const galleryPhotoLookupStream$ = from(this.getGalleryPhotoById(galleryPhotoId)).pipe(
            concatMap((galleryPhotoData: GalleryPhoto) => galleryPhotoData ?
                of(galleryPhotoData) :
                throwError(() => new NotFoundException("Gallery Photo Information does not found"))
            ),
            tap((foundGalleryPhoto: GalleryPhoto) => galleryPhoto = foundGalleryPhoto)
        );

        const generateCompositeImageStream$ = () => concatMap(() => {
            const payload: IGenerateCompositeImage = {
                scale,
                mainImageWidth,
                mainImageHeight,
                backgroundImageWidth: 446,
                backgroundImageHeight: 600,
                offsetX,
                offsetY,
                selectedImagePath: selectedImagePath,
                modifiedImagePath: compositeImageUrl
            };

            return from(ImageProcessor.generateCompositeImage(payload));
        });

        const deleteSelectedImageStream$ = () => concatMap(() => from(FileOperation.deleteFile(selectedImagePath)));

        const updateGalleryPhotoStream$ = () => concatMap(() => {
            if (compositeImageUrl) galleryPhoto.image = compositeImageUrl;

            return from(galleryPhoto.save());
        });

        const execution$ = galleryPhotoLookupStream$.pipe(
            generateCompositeImageStream$(),
            deleteSelectedImageStream$(),
            updateGalleryPhotoStream$()
        );

        return lastValueFrom(execution$);
    }

    public async deleteGalleryPhoto(galleryPhotoId: string) {
        let galleryPhoto: GalleryPhoto;

        const galleryPhotoLookupStream$ = from(this.getGalleryPhotoById(galleryPhotoId)).pipe(
            concatMap((galleryPhotoData: GalleryPhoto) => galleryPhotoData ?
                of(galleryPhotoData) :
                throwError(() => new NotFoundException("Gallery Photo Information does not found"))
            ),
            tap((foundGalleryPhoto: GalleryPhoto) => galleryPhoto = foundGalleryPhoto)
        );

        const deleteFileImageStream$ = () => concatMap(() => {
            const {image} = galleryPhoto;
            if (image) {
                const galleryPhotoImagePath = extractImagePath(image);
                return from(FileOperation.deleteFile(galleryPhotoImagePath));
            }

            return of(null);
        });

        const deletePhotoRecordStream$ = () => concatMap(() => {
            return from(this.galleryPhotoRepository.deletePhotoById(galleryPhotoId)).pipe(
                concatMap((deleteResult: DeleteResult) => {
                    if (deleteResult.affected === 0) {
                        return throwError(() => new NotFoundException(`Photo with id ${galleryPhotoId} does not found`));
                    }

                    return of(null);
                })
            );
        });

        const execution$ = galleryPhotoLookupStream$.pipe(
            deleteFileImageStream$(),
            deletePhotoRecordStream$(),
            map(() => ({
                success: true
            }))
        );

        return lastValueFrom(execution$);
    }

    public async deleteResizedImage(resizedImageUrl: string) {
        const resizedImagePath: string = extractImagePath(resizedImageUrl);

        const execution$ = from(FileOperation.deleteFile(resizedImagePath)).pipe(
            map(() => ({
                success: true
            }))
        );

        return lastValueFrom(execution$);
    }

    public async resizeGalleryPhoto(resizeGalleryPhotoDto: ResizeGalleryPhotoDto) {
        const {galleryPhotoUrl, height, width} = resizeGalleryPhotoDto;
        const galleryPhotoPath = extractImagePath(galleryPhotoUrl);
        let loadedImage: Jimp;
        let resizedImagePath: string;

        const imageReaderStream$ = from(JimpUtil.readImage(galleryPhotoPath)).pipe(
            tap((foundLoadedImage: Jimp) => loadedImage = foundLoadedImage)
        );
        const resizeImageStream$ = () => concatMap(() => from(JimpUtil.resizeImage(loadedImage, width, height)));

        const saveResizedImageStream$ = () => concatMap(() => {
            const fileName = generateRandomFilename();
            resizedImagePath = `${ImagePath.GALLERY_PHOTO}/${fileName}.jpeg`;

            return from(loadedImage.writeAsync(resizedImagePath));
        });

        const execution$ = imageReaderStream$.pipe(
            resizeImageStream$(),
            saveResizedImageStream$(),
            map(() => ({
                resizedImageUrl: `${CONFIG.SERVER_URL}/${resizedImagePath}`
            }))
        );

        return lastValueFrom(execution$);
    }
}
