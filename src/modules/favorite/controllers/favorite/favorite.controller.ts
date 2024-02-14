import { Body, Controller, Delete, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { FavoriteService } from "../../services/favorite/favorite.service";
import { AuthenticatedUser } from "../../../../decorators/authenticated-user.decorator";
import { User } from "../../../user/entities/user.entity";
import { DeletePhotoFromFavoriteListDto } from "../../dtos/favorite/delete-photo-from-favorite-list.dto";
import { SavePhotoInFavoriteListDto } from "../../dtos/favorite/save-photo-in-favorite-list.dto";
import { UserAuthGuard } from "../../../../guards/user-auth.guard";
import { RequiredParam } from "../../../../decorators/required-param.decorator";
import { RequiredQuery } from "../../../../decorators/required-query.decorator";

@ApiSecurity("API-KEY")
@Controller("favorite-lists")
@UseGuards(UserAuthGuard)
export class FavoriteController {

  constructor(private favoriteListService: FavoriteService) {
  }

  @Get()
  getFavoriteLists(@AuthenticatedUser() user: User) {
    return this.favoriteListService.getUserFavoriteList(user);
  }

  @ApiParam({ name: "favoriteId", type: String, required: true })
  @ApiQuery({ name: "photoId", type: String, required: true })
  @Get(":favoriteId/check-favorite-gallery-photo-existence")
  checkIfPhotoExistsInFavorite(@RequiredParam("favoriteId") favoriteId: string,
                               @RequiredQuery("photoId") photoId: string) {
    return this.favoriteListService.checkIfPhotoExistsInFavorite(favoriteId, photoId);
  }

  @ApiBody({ type: SavePhotoInFavoriteListDto, required: true })
  @Post("delete-favorite-item")
  savePhotoInFavoriteList(@Body() savePhotoInFavoriteListDto: SavePhotoInFavoriteListDto) {
    return this.favoriteListService.savePhotoInFavoriteList(savePhotoInFavoriteListDto);
  }

  @ApiParam({ name: "favoriteId", type: String, required: true })
  @Delete(":favoriteId/clear-favorite-list-content")
  clearFavoriteListContent(@RequiredParam("favoriteId") favoriteId: string) {
    return this.favoriteListService.clearFavoriteListContent(favoriteId);
  }

  @ApiQuery({ type: DeletePhotoFromFavoriteListDto, required: true })
  @Delete("delete-gallery-photo-from-favorite")
  deletePhotoFromFavoriteList(@Query() deletePhotoFromFavoriteListDto: DeletePhotoFromFavoriteListDto) {
    return this.favoriteListService.deletePhotoFromFavoriteList(deletePhotoFromFavoriteListDto);
  }
}
