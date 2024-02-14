import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { GalleryPhoto } from "../entities/gallery-photo.entity";
import { IGetGalleryPhoto } from "../interfaces/gallery-photo/get-gallery-photo.interface";
import { IFilterPhotoCount } from "../interfaces/gallery-photo/filter-photo-count.interface";
import { ICreateGalleryPhoto } from "../interfaces/gallery-photo/create-gallery-photo.interface";
import { IGetUserPhoto } from "../interfaces/gallery-photo/get-user-photo.interface";

@Injectable()
export class GalleryPhotoRepository extends Repository<GalleryPhoto> {

  constructor(dataSource: DataSource) {
    super(GalleryPhoto, dataSource.createEntityManager());
  }

  public async getGalleryPhotoById(id: string) {
    return this.findOne({
      where: {
        id
      },
      relations: ["user"]
    });
  }

  public async getPhotosCount(payload: IFilterPhotoCount): Promise<number> {
    return this.createQueryBuilder("photo")
      .where(payload)
      .getCount();
  }

  public async getGalleryPhotos(payload: IGetGalleryPhoto): Promise<GalleryPhoto[]> {
    const { limit, page, galleryId } = payload;
    const skippedItems = limit * (page - 1);
    const conditions = {
      galleryId
    };

    return this.createQueryBuilder("photo")
      .where(conditions)
      .orderBy("gallery-photo.id", "DESC")
      .offset(skippedItems)
      .limit(limit)
      .getMany();
  }

  public async getUserPhotos(payload: IGetUserPhoto) {
    const { limit, page, userId } = payload;
    const skippedItems = limit * (page - 1);
    return this.createQueryBuilder("photo")
      .where({
        userId
      })
      .orderBy("gallery-photo.id", "DESC")
      .offset(skippedItems)
      .limit(limit)
      .getMany();
  }

  public async createGalleryPhoto(payload: ICreateGalleryPhoto) {
    const galleryPhotoSaved = this.create(payload);
    return galleryPhotoSaved.save();
  }

  public async setGalleryPhotoUrl(galleryPhotoId: string, imageUrl: string) {
    return this.createQueryBuilder("galleryPhoto")
      .update(GalleryPhoto)
      .set({ image: imageUrl })
      .where("id = :id", { id: galleryPhotoId })
      .execute();
  }

  public async deletePhotoById(photoId: string) {
    return this.delete(photoId);
  }
}
