import { Injectable, NotFoundException } from "@nestjs/common";
import { concatMap, from, lastValueFrom, map, of, throwError } from "rxjs";
import { tap } from "rxjs/operators";
import { GalleryPhoto } from "../../../gallery/entities/gallery-photo.entity";
import { Favorite } from "../../entities/favorite.entity";
import { FavoritePhotoRepository } from "../../repositories/favorite-photo.repository";
import { IGetFavoriteGalleryPhoto } from "../../interfaces/favorite-gallery-photo/get-favorite-gallery-photo.interface";
import { DeleteResult } from "typeorm";
import { ICreateFavoriteGalleryPhoto } from "../../interfaces/favorite-gallery-photo/create-favorite-gallery-photo.interface";
import { GetFavoriteGalleryPhotoDto } from "../../dtos/favorite-gallery-photo/dto/get-favorite-gallery-photo.dto";
import { FavoriteGalleryPhoto } from "../../entities/favorite-gallery-photo.entity";
import {
  IDeleteFavoriteGalleryPhoto
} from "../../interfaces/favorite-gallery-photo/delete-favorite-gallery-photo.interface";
import { IFilterFavoriteGalleryPhoto } from "../../interfaces/favorite-gallery-photo/filter-favorite-gallery-photo.interface";

@Injectable()
export class FavoriteGalleryPhotoService {

  constructor(private favoritePhotoRepository: FavoritePhotoRepository) {
  }

  public async getFavoriteGalleriesPhotos(getFavoriteGalleryPhotoDto: GetFavoriteGalleryPhotoDto): Promise<IGetFavoriteGalleryPhoto> {
    const { favoriteId, page, limit } = getFavoriteGalleryPhotoDto;
    let favoriteGalleriesPhotos: FavoriteGalleryPhoto[];
    let favoritePhotosCount: number;

    const favoritePhotosPayload: IFilterFavoriteGalleryPhoto = {
      page,
      limit,
      favoriteId
    };

    const favoriteGalleriesPhotosStream$ = from(this.favoritePhotoRepository.getFavoriteGalleriesPhotos(favoritePhotosPayload)).pipe(
      tap((foundFavoriteGalleriesPhotos: FavoriteGalleryPhoto[]) => favoriteGalleriesPhotos = foundFavoriteGalleriesPhotos)
    );
    const getFavoriteGalleriesPhotosCountStream$ = () => concatMap(() =>
      from(this.favoritePhotoRepository.getFavoriteGalleriesPhotosCount(favoritePhotosPayload)).pipe(
        tap(count => favoritePhotosCount = count)
      ));

    const execution$ = favoriteGalleriesPhotosStream$.pipe(
      getFavoriteGalleriesPhotosCountStream$(),
      map(() => ({
        data: favoriteGalleriesPhotos,
        page,
        limit,
        dataCount: favoritePhotosCount
      }))
    );

    return lastValueFrom(execution$);
  }

  public async getFavoriteGalleryPhoto(favoriteId: string, galleryPhotoId: string): Promise<any> {
    const favoritePhotoPayload: IFilterFavoriteGalleryPhoto = {
      favoriteId,
      galleryPhotoId
    };

    return this.favoritePhotoRepository.getFavoriteGalleryPhoto(favoritePhotoPayload);
  }

  public async pushGalleryPhotoToFavoriteList(favorite: Favorite, galleryPhoto: GalleryPhoto) {
    const { name, information, image } = galleryPhoto;

    const payload: ICreateFavoriteGalleryPhoto = {
      ...(!!galleryPhoto && !!name && { name }),
      ...(!!galleryPhoto && !!information && { information }),
      ...(!!galleryPhoto && !!image && { link: image }),
      galleryPhoto,
      favorite
    };

    return this.favoritePhotoRepository.createFavoriteGalleryPhoto(payload);
  }

  public async deleteFavoriteGalleriesPhotosByIds(id: string[]) {
    const execution$ = from(this.favoritePhotoRepository.deleteFavoriteGalleriesPhotosByFavoritesIds(id)).pipe(
      concatMap((result: DeleteResult) => {
        if (result.affected === 0) {
          return throwError(() => new NotFoundException("Favorite photos does not found"));
        }

        return of(null);
      })
    );

    return lastValueFrom(execution$);
  }

  public async deleteFavoriteGalleryPhoto(deleteFavoriteGalleryPhoto: IDeleteFavoriteGalleryPhoto) {
    const { favoriteId, galleryPhotoId } = deleteFavoriteGalleryPhoto;
    const favoritePhotoDeletionPayload: IFilterFavoriteGalleryPhoto = {
      galleryPhotoId,
      favoriteId
    };
    const execution$ = from(this.favoritePhotoRepository.deleteFavoriteGalleryPhoto(favoritePhotoDeletionPayload)).pipe(
      concatMap((result: DeleteResult) => {
        if (result.affected === 0) {
          return throwError(() => new NotFoundException(`Favorite photo does not found`));
        }

        return of(null);
      })
    );

    return lastValueFrom(execution$);
  }

}
