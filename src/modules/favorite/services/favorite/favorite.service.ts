import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { concatMap, from, lastValueFrom, map, of, throwError } from "rxjs";
import { tap } from "rxjs/operators";
import { Favorite } from "../../entities/favorite.entity";
import { FavoriteGalleryPhotoService } from "../favorite-gallery-photo/favorite-gallery-photo.service";
import { GalleryPhoto } from "../../../gallery/entities/gallery-photo.entity";
import { FavoriteRepository } from "../../repositories/favorite.repository";
import { ICreateFavoriteList } from "../../interfaces/favorite/create-favorite-list.interface";
import { User } from "../../../user/entities/user.entity";
import { DeletePhotoFromFavoriteListDto } from "../../dtos/favorite/delete-photo-from-favorite-list.dto";
import { IDeleteFavoriteGalleryPhoto } from "../../interfaces/favorite-gallery-photo/delete-favorite-gallery-photo.interface";
import { GalleryPhotoService } from "../../../gallery/services/gallery-photo.service";
import { SavePhotoInFavoriteListDto } from "../../dtos/favorite/save-photo-in-favorite-list.dto";
import { IFilterUserFavoriteList } from "../../interfaces/favorite/filter-user-favorite-list.interface";

@Injectable()
export class FavoriteService {

  constructor(private favoriteRepository: FavoriteRepository,
              private favoriteGalleryPhotoService: FavoriteGalleryPhotoService,
              private photoService: GalleryPhotoService) {
  }

  public async getUserFavoriteList(user: User): Promise<Favorite> {
    const { profileId } = user;
    const userFavoriteListPayload: IFilterUserFavoriteList = {
      profileId
    };

    return this.favoriteRepository.getUserFavoriteList(userFavoriteListPayload);
  }

  public async checkIfPhotoExistsInFavorite(favoriteId: string, galleryPhotoId: string): Promise<any> {
    const execution$ = from(this.favoriteRepository.getFavoritePhoto(favoriteId, galleryPhotoId)).pipe(
      map((favorite: Favorite) => {
        const areFavoritePhotosExisting = favorite.favoriteGalleriesPhotos?.length > 0;
        if (areFavoritePhotosExisting) {
          return {
            isFavoritePhotoExisting: true
          };
        }

        return {
          isFavoritePhotoExisting: false
        };
      })
    );

    return lastValueFrom(execution$);
  }

  public async createFavoriteList(createFavoriteList: ICreateFavoriteList) {
    return this.favoriteRepository.createFavoriteList(createFavoriteList);
  }

  public async getFavoriteList(favoriteId: string): Promise<Favorite> {
    const userFavoriteListPayload: IFilterUserFavoriteList = {
      favoriteId
    };
    const execution$ = from(this.favoriteRepository.getUserFavoriteList(userFavoriteListPayload)).pipe(
      concatMap((favoriteList: Favorite) =>
        favoriteList ?
          of(favoriteList) :
          throwError(() => new NotFoundException("Favorite list does not found")))
    );

    return lastValueFrom(execution$);
  }

  public async clearFavoriteListContent(favoriteId: string): Promise<Favorite> {
    const favoriteStream$ = from(this.getFavoriteList(favoriteId));

    const clearFavoriteListStream$ = () => concatMap((favorite: Favorite) => {
      const favoriteGalleriesPhotosIds = favorite.favoriteGalleriesPhotos.map(favoriteGalleryPhoto => favoriteGalleryPhoto.id);
      return from(this.favoriteGalleryPhotoService.deleteFavoriteGalleriesPhotosByIds(favoriteGalleriesPhotosIds)).pipe(
        concatMap(() => {
          favorite.favoriteGalleriesPhotos = [];
          return from(favorite.save());
        })
      );
    });

    const execution$ = favoriteStream$.pipe(
      clearFavoriteListStream$()
    );

    return lastValueFrom(execution$);
  }

  public async deletePhotoFromFavoriteList(deletePhotoFromFavoriteListDto: DeletePhotoFromFavoriteListDto) {
    const { favoriteId, galleryPhotoId } = deletePhotoFromFavoriteListDto;
    const favoritePhotoDeletionPayload: IDeleteFavoriteGalleryPhoto = {
      favoriteId,
      galleryPhotoId
    };

    return this.favoriteGalleryPhotoService.deleteFavoriteGalleryPhoto(favoritePhotoDeletionPayload);
  }

  public async savePhotoInFavoriteList(savePhotoInFavoriteListDto: SavePhotoInFavoriteListDto) {
    const { favoriteId, galleryPhotoId } = savePhotoInFavoriteListDto;
    let galleryPhoto: GalleryPhoto;
    let favorite: Favorite;

    const galleryPhotoLookupStream$ = from(this.photoService.getGalleryPhotoById(galleryPhotoId)).pipe(
      concatMap((galleryPhotoData: GalleryPhoto) => galleryPhotoData ?
        of(galleryPhotoData) :
        throwError(() => new NotFoundException("Gallery Photo Information does not found"))
      ),
      tap((foundGalleryPhoto: GalleryPhoto) => galleryPhoto = foundGalleryPhoto)
    );

    const getFavoriteListStream$ = () => concatMap(() =>
      from(this.getFavoriteList(favoriteId)).pipe(
        tap((foundFavoriteList: Favorite) => favorite = foundFavoriteList)
      ));

    const pushPhotoToFavoriteListStream$ = () => concatMap(() =>
      from(this.favoriteGalleryPhotoService.pushGalleryPhotoToFavoriteList(favorite, galleryPhoto)));

    const execution$ = galleryPhotoLookupStream$.pipe(
      getFavoriteListStream$(),
      pushPhotoToFavoriteListStream$()
    );

    return lastValueFrom(execution$);
  }
}
