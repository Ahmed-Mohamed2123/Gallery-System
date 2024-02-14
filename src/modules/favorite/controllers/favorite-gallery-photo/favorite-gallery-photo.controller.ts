import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { FavoriteGalleryPhotoService } from "../../services/favorite-gallery-photo/favorite-gallery-photo.service";
import { GetFavoriteGalleryPhotoDto } from "../../dtos/favorite-gallery-photo/dto/get-favorite-gallery-photo.dto";
import { UserAuthGuard } from "../../../../guards/user-auth.guard";
import { RequiredParam } from "../../../../decorators/required-param.decorator";
import { RequiredQuery } from "../../../../decorators/required-query.decorator";

@ApiSecurity("API-KEY")
@Controller("favorite-gallery-photo")
@UseGuards(UserAuthGuard)
export class FavoriteGalleryPhotoController {
  constructor(private photosFavoriteService: FavoriteGalleryPhotoService) {
  }

  @ApiParam({ name: "favoriteId", type: String, required: true })
  @ApiQuery({ name: "galleryPhotoId", type: String, required: true })
  @Get(":favoriteId")
  getFavoriteGalleryPhoto(@RequiredParam("favoriteId") favoriteId: string,
                          @RequiredQuery("galleryPhotoId") galleryPhotoId: string) {
    return this.photosFavoriteService.getFavoriteGalleryPhoto(favoriteId, galleryPhotoId);
  }

  @ApiBody({ type: GetFavoriteGalleryPhotoDto, required: true })
  @Post("favorite-galleries-photos")
  getFavoriteGalleriesPhotos(@Body() getFavoriteGalleryPhotoDto: GetFavoriteGalleryPhotoDto) {
    return this.photosFavoriteService.getFavoriteGalleriesPhotos(getFavoriteGalleryPhotoDto);
  }
}
