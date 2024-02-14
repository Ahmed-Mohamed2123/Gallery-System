import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { concatMap, forkJoin, from, lastValueFrom, map, of, throwError } from "rxjs";
import { tap } from "rxjs/operators";
import { FileOperation } from "../../../utils/file-operation";
import { extractImagePath } from "../../../shared/helpers/image-path-extractor";
import { Gallery } from "../entities/gallery.entity";
import { GalleryPhotoService } from "./gallery-photo.service";
import { ImageProcessor } from "../../../shared/utils/image-processor";
import { GalleryRepository } from "../repositories/gallery.repository";
import { ICreateGallery } from "../interfaces/gallery/create-gallery.interface";
import { CreateGalleryDto } from "../dtos/gallery/create-gallery.dto";
import { User } from "../../user/entities/user.entity";
import { UserService } from "../../user/services/user.service";
import { IGenerateCompositeImage } from "../../../shared/interfaces/generate-composite-image.interface";
import { GetUserGalleryDto } from "../dtos/gallery/get-user-gallery.dto";
import { IGetUserGallery } from "../interfaces/gallery/get-user-gallery.interface";
import { ImageInformationDto } from "../../../shared/dtos/image-information.dto";
import { ObjectParser } from "../../../shared/utils/object-parser";
import { ImagePath } from "../../../shared/enums/image-path.enum";
import { generateRandomFilename } from "../../../shared/helpers/file-name-generator";

@Injectable()
export class GalleryService {

  constructor(private galleryRepo: GalleryRepository,
              @Inject(forwardRef(() => GalleryPhotoService)) private photoService: GalleryPhotoService,
              @Inject(forwardRef(() => UserService)) private userService: UserService) {
  }

  public async getUserGalleries(getGalleryPhotoDto: GetUserGalleryDto) {
    const { limit, page, userId } = getGalleryPhotoDto;
    let galleriesCount: number;
    let galleries: Gallery[];

    const galleriesCountStream$ = from(this.galleryRepo.getUserGalleriesCount(userId)).pipe(
      tap((foundGalleriesCount: number) => galleriesCount = foundGalleriesCount)
    );
    const getUserGalleriesStream$ = () => concatMap(() => {
      const payload: IGetUserGallery = {
        limit, page, userId
      };
      return from(this.galleryRepo.getUserGalleries(payload)).pipe(
        tap((foundGalleries: Gallery[]) => galleries = foundGalleries)
      );
    });

    const execution$ = galleriesCountStream$.pipe(
      getUserGalleriesStream$(),
      map(() => ({
        galleriesCount,
        galleries
      }))
    );

    return lastValueFrom(execution$);
  }

  public async createGallery(createGalleryDto: CreateGalleryDto) {
    const { userId, name } = createGalleryDto;
    let userData: User;

    const userDataLookupStream$ = from(this.userService.getUserById(userId)).pipe(
      concatMap((userData: User) => userData ?
        of(userData) :
        throwError(() => new NotFoundException("user does not found"))
      ),
      tap((foundUser: User) => userData = foundUser)
    );

    const createGalleryStream$ = () => concatMap(() => {
      const payload: ICreateGallery = {
        user: userData,
        name
      };

      return from(this.galleryRepo.createGallery(payload));
    });

    const execution$ = userDataLookupStream$.pipe(
      createGalleryStream$()
    );

    return lastValueFrom(execution$);
  }

  public async uploadGalleryPhoto(
    galleryId: string,
    selectedImageFile: { path: string },
    imageInformationDto: ImageInformationDto
  ) {
    const {
      scale,
      mainImageWidth,
      mainImageHeight,
      offsetX,
      offsetY
    } = ObjectParser.parseValuesToFloat(imageInformationDto);
    const { path } = selectedImageFile;
    let compositeImageUrl: string;

    const galleryLookupStream$ = from(this.galleryRepo.getGalleryById(galleryId)).pipe(
      concatMap((gallery: Gallery) =>
        gallery ? of(gallery) : throwError(() => new NotFoundException()))
    );

    const generateCompositeImageStream$ = () => concatMap(() => {
      const fileName = generateRandomFilename();
      const payload: IGenerateCompositeImage = {
        scale,
        mainImageWidth,
        mainImageHeight,
        backgroundImageWidth: 238,
        backgroundImageHeight: 280,
        offsetX,
        offsetY,
        selectedImagePath: path,
        modifiedImagePath: `${ImagePath.GALLERY}/${fileName}.jpeg`
      };

      return from(ImageProcessor.generateCompositeImage(payload)).pipe(
        tap(({ imageUrl }) => compositeImageUrl = imageUrl)
      );
    });

    const deleteSelectedImageStream$ = () => concatMap(() => from(FileOperation.deleteFile(path)));

    const setGalleryPhotoStream$ = () => concatMap(() =>
      from(this.galleryRepo.updateGalleryPhoto(galleryId, compositeImageUrl)));

    const execution$ = galleryLookupStream$.pipe(
      generateCompositeImageStream$(),
      deleteSelectedImageStream$(),
      setGalleryPhotoStream$()
    );

    return lastValueFrom(execution$);
  }

  public async getGalleryListByGalleryId(galleryId: string): Promise<Gallery> {
    const execution$ = from(this.galleryRepo.getGalleryById(galleryId)).pipe(
      concatMap((gallery: Gallery) =>
        gallery ?
          of(gallery) :
          throwError(() => new NotFoundException("Gallery list does not found"))
      )
    );

    return lastValueFrom(execution$);
  }

  public async updateUserGalleryCollection(
    galleryId: string,
    name: string,
    selectedGalleryImage: Express.Multer.File,
    imageInformationDto: ImageInformationDto
  ): Promise<Gallery> {
    const {
      scale,
      mainImageWidth,
      mainImageHeight,
      offsetX,
      offsetY
    } = ObjectParser.parseValuesToFloat(imageInformationDto);
    const { path } = selectedGalleryImage;
    const fileName = generateRandomFilename();
    const compositeImageUrl: string = `${ImagePath.GALLERY}/${fileName}.jpeg`;

    const galleryStream$ = from(this.getGalleryListByGalleryId(galleryId));

    const generateCompositeImageStream$ = () => concatMap(() => {
      const generateCompositeImagePayload: IGenerateCompositeImage = {
        scale,
        mainImageWidth,
        mainImageHeight,
        backgroundImageWidth: 238,
        backgroundImageHeight: 280,
        offsetX,
        offsetY,
        selectedImagePath: path,
        modifiedImagePath: compositeImageUrl
      };

      return from(ImageProcessor.generateCompositeImage(generateCompositeImagePayload));
    });

    const deleteSelectedGalleryImageStream$ = () => concatMap(() => from(FileOperation.deleteFile(path)));

    const execution$ = galleryStream$.pipe(
      concatMap((gallery: Gallery) => {
        if (name) gallery.name = name;
        if (selectedGalleryImage) {
          return of({}).pipe(
            generateCompositeImageStream$(),
            deleteSelectedGalleryImageStream$(),
            concatMap(() => {
              gallery.imageUrl = compositeImageUrl;
              return from(gallery.save());
            })
          );
        }

        return from(gallery.save());
      })
    );

    return lastValueFrom(execution$);
  }

  public async deleteGallery(galleryId: number) {
    const galleryDetailsLookupStream$ = from(this.galleryRepo.getGalleryDetailsById(galleryId)).pipe(
      concatMap((galleryDetails: Gallery) =>
        galleryDetails ? of(galleryDetails)
          : throwError(() => new NotFoundException("Gallery does not found!"))
      )
    );

    const deleteGalleryImageFileStream$ = (galleryImageUrl: string) => concatMap(() => {
      const galleryImagePath = extractImagePath(galleryImageUrl);
      return from(FileOperation.deleteFile(galleryImagePath));
    });

    const deleteGalleryPhotosStream$ = (galleryDetails: Gallery) => concatMap(() => {
      const areGalleryPhotosExisting = galleryDetails.galleryPhotos.length > 0;
      if (!areGalleryPhotosExisting) return of(null);

      const streams$ = galleryDetails.galleryPhotos.map(photo =>
        from(this.photoService.deleteGalleryPhoto(photo.id))
      );

      return forkJoin(streams$);
    });

    const deleteGalleryRecordStream$ = () => concatMap(() => from(this.galleryRepo.delete(galleryId)));

    const execution$ = galleryDetailsLookupStream$.pipe(
      concatMap((galleryDetails: Gallery) => {
        const { imageUrl } = galleryDetails;
        if (imageUrl) {
          return of({}).pipe(
            deleteGalleryImageFileStream$(imageUrl),
            deleteGalleryPhotosStream$(galleryDetails),
            deleteGalleryRecordStream$()
          );
        }

        return of({}).pipe(
          deleteGalleryPhotosStream$(galleryDetails),
          deleteGalleryRecordStream$()
        );
      }),
      map(() => ({
        success: true
      }))
    );

    return lastValueFrom(execution$);
  }
}
