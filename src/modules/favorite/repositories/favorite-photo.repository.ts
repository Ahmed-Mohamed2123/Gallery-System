import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { FavoriteGalleryPhoto } from "../entities/favorite-gallery-photo.entity";
import { ICreateFavoriteGalleryPhoto } from "../interfaces/favorite-gallery-photo/create-favorite-gallery-photo.interface";
import { IFilterFavoriteGalleryPhoto } from "../interfaces/favorite-gallery-photo/filter-favorite-gallery-photo.interface";

@Injectable()
export class FavoritePhotoRepository extends Repository<FavoriteGalleryPhoto> {

  constructor(dataSource: DataSource) {
    super(FavoriteGalleryPhoto, dataSource.createEntityManager());
  }

  public async getFavoriteGalleriesPhotos(payload: IFilterFavoriteGalleryPhoto) {
    const { limit, page, favoriteId } = payload;
    const skippedItems = limit * (page - 1);

    return this.createQueryBuilder("favoriteGalleryPhoto")
      .where({
        favoriteId
      })
      .orderBy("favoriteGalleryPhoto.id", "DESC")
      .offset(skippedItems)
      .limit(limit)
      .getMany();
  }

  public async getFavoriteGalleriesPhotosCount(payload: IFilterFavoriteGalleryPhoto) {
    const { favoriteId } = payload;
    return this.createQueryBuilder("favoriteGalleryPhoto")
      .where({
        favoriteId
      }).getCount();
  }

  public async getFavoriteGalleryPhoto(payload: IFilterFavoriteGalleryPhoto) {
    const { favoriteId, galleryPhotoId } = payload;
    return this.findOne({
      where: {
        favoriteId: favoriteId,
        galleryPhotoId
      }
    });
  }

  public async deleteFavoriteGalleriesPhotosByFavoritesIds(ids: string[]) {
    return this.createQueryBuilder("favoriteGalleryPhoto")
      .delete()
      .from(FavoriteGalleryPhoto)
      .where("id IN (:ids)", { ids })
      .execute();
  }

  public async deleteFavoriteGalleryPhoto(payload: IFilterFavoriteGalleryPhoto) {
    const { favoriteId, galleryPhotoId } = payload;
    return this.createQueryBuilder("favoriteGalleryPhoto")
      .delete()
      .from(FavoriteGalleryPhoto)
      .where("favoriteId = :favoriteId AND galleryPhotoId = :galleryPhotoId", { favoriteId, galleryPhotoId })
      .execute();
  }

  public async createFavoriteGalleryPhoto(payload: ICreateFavoriteGalleryPhoto) {
    const favoritePhotoSaved = this.create(payload);
    return favoritePhotoSaved.save();
  }

}
