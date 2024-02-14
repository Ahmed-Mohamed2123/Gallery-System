import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Gallery } from "../entities/gallery.entity";
import { ICreateGallery } from "../interfaces/gallery/create-gallery.interface";
import { IGetUserGallery } from "../interfaces/gallery/get-user-gallery.interface";

@Injectable()
export class GalleryRepository extends Repository<Gallery> {
  constructor(dataSource: DataSource) {
    super(Gallery, dataSource.createEntityManager());
  }

  public async getGalleryById(galleryId: string): Promise<Gallery> {
    return this.findOne({
      where: {
        id: galleryId
      }
    });
  }

  public async getGalleryDetailsById(galleryId: number) {
    return this.createQueryBuilder("gallery")
      .where({ id: galleryId })
      .leftJoinAndSelect("gallery.photos", "photos")
      .getOne();
  }


  public async getUserGalleriesCount(userId: string) {
    return this.count({
      where: { userId }
    });
  }

  public async getUserGalleries(payload: IGetUserGallery) {
    const { limit, page, userId } = payload;
    const skippedItems = limit * (page - 1);
    const conditions = {
      userId
    };

    return this.find({
      where: conditions,
      skip: skippedItems,
      take: page,
      order: { createdAt: "DESC" }
    });
  }

  public async createGallery(payload: ICreateGallery) {
    const gallerySaved = this.create(payload);
    return gallerySaved.save();
  }

  public async updateGalleryPhoto(galleryId: string, imageUrl: string) {
    return this.createQueryBuilder("gallery")
      .where({ galleryId })
      .update({ imageUrl: imageUrl, updatedAt: new Date() })
      .execute();
  }
}
