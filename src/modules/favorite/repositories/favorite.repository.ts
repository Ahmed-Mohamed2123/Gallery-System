import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Favorite } from "../entities/favorite.entity";
import { ICreateFavoriteList } from "../interfaces/favorite/create-favorite-list.interface";
import { IFilterUserFavoriteList } from "../interfaces/favorite/filter-user-favorite-list.interface";

@Injectable()
export class FavoriteRepository extends Repository<Favorite> {

  constructor(dataSource: DataSource) {
    super(Favorite, dataSource.createEntityManager());
  }

  public async getUserFavoriteList(payload: IFilterUserFavoriteList): Promise<Favorite> {
    const { profileId, favoriteId } = payload;
    return this.findOne({
      where: {
        id: favoriteId,
        profile: { id: profileId }
      },
      relations: ["favoriteGalleriesPhotos"]
    });
  }

  public async getFavoritePhoto(favoriteId: string, galleryPhotoId: string) {
    return this.createQueryBuilder("favorite")
      .where({
        id: favoriteId
      })
      .leftJoinAndSelect(
        "favorite.favoritePhotos",
        "favoritePhotos",
        `favoritePhotos.photoId = ${galleryPhotoId}`)
      .getOne();
  }

  public async createFavoriteList(payload: ICreateFavoriteList): Promise<Favorite> {
    const { profile } = payload;
    const favorite = new Favorite();
    favorite.profile = profile;
    favorite.favoriteGalleriesPhotos = [];
    return favorite.save();
  }
}