import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  UploadedFile, UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { GalleryPhotoService } from "../services/gallery-photo.service";
import { ApiBody, ApiParam, ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ResizeGalleryPhotoDto } from "../dtos/gallery-photo/resize-gallery-photo.dto";
import { GetUserGalleryPhotoDto } from "../dtos/gallery-photo/get-user-gallery-photo.dto";
import { UpdateGalleryPhotoDto } from "../dtos/gallery-photo/update-gallery-photo.dto";
import { CreateGalleryPhotoDto } from "../dtos/gallery-photo/create-gallery-photo.dto";
import { ImageInformationDto } from "../../../shared/dtos/image-information.dto";
import { UserAuthGuard } from "../../../guards/user-auth.guard";
import { RequiredParam } from "../../../decorators/required-param.decorator";
import { RequiredQuery } from "../../../decorators/required-query.decorator";
import { GetGalleryPhotoDto } from "../dtos/gallery-photo/get-gallery-photo.dto";
import { ImagePath } from "../../../shared/enums/image-path.enum";
import { MulterUploader } from "../../../shared/utils/multer-uploader";

const MULTER_CONFIGURATION = {
  storage: diskStorage({
    destination: ImagePath.GALLERY_PHOTO,
    filename: MulterUploader.editFileName
  }),
  fileFilter: MulterUploader.checkValidImageExtension
};

@ApiSecurity("API-KEY")
@Controller("gallery-photo")
export class GalleryPhotoController {

  constructor(private galleryPhotoService: GalleryPhotoService) {
  }

  @ApiBody({ type: GetGalleryPhotoDto })
  @Post("gallery-photos")
  getGalleryPhotos(@Body() getGalleryPhotoDto: GetGalleryPhotoDto) {
    return this.galleryPhotoService.getGalleryPhotos(getGalleryPhotoDto);
  }

  @ApiBody({ type: GetUserGalleryPhotoDto })
  @Post("user-galleries-photos")
  getUserGalleriesPhotos(@Body() getUserGalleryPhotoDto: GetUserGalleryPhotoDto) {
    return this.galleryPhotoService.getUserGalleriesPhotos(getUserGalleryPhotoDto);
  }

  @ApiBody({ type: ResizeGalleryPhotoDto })
  @Post("resize-gallery-photo")
  @UseGuards(UserAuthGuard)
  resizeGalleryPhoto(@Body() resizeGalleryPhotoDto: ResizeGalleryPhotoDto) {
    return this.galleryPhotoService.resizeGalleryPhoto(resizeGalleryPhotoDto);
  }

  @ApiBody({ type: CreateGalleryPhotoDto })
  @Post("create-gallery-photo")
  @UseGuards(UserAuthGuard)
  createGalleryPhotoInformation(
    @Body() createGalleryPhotoDto: CreateGalleryPhotoDto) {
    return this.galleryPhotoService.createGalleryPhotoInformation(createGalleryPhotoDto);
  }

  @ApiParam({ name: "galleryPhotoId", required: true, type: String })
  @ApiBody({ type: ImageInformationDto })
  @Post(":galleryPhotoId/upload-gallery-photo")
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor("imageFile", MULTER_CONFIGURATION) as any)
  uploadGalleryPhoto(
    @RequiredParam("galleryPhotoId") galleryPhotoId: string,
    @Body() imageInformationDto: ImageInformationDto,
    @UploadedFile() imageFile: Express.Multer.File) {
    return this.galleryPhotoService.uploadGalleryPhoto(galleryPhotoId, imageFile, imageInformationDto);
  }

  @ApiBody({ type: UpdateGalleryPhotoDto })
  @Put("update-gallery-photo-information")
  @UseGuards(UserAuthGuard)
  updateGalleryPhotoInformation(@Body() updateGalleryPhotoDto: UpdateGalleryPhotoDto) {
    return this.galleryPhotoService.updateGalleryPhotoInformation(
      updateGalleryPhotoDto
    );
  }

  @ApiBody({ type: UpdateGalleryPhotoDto })
  @ApiBody({ type: ImageInformationDto })
  @Put("update-gallery-photo")
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor("imageFile", MULTER_CONFIGURATION) as any)
  updateGalleryPhoto(@RequiredParam("galleryPhotoId") galleryPhotoId: string,
                     @Body() imageInformationDto: ImageInformationDto,
                     @UploadedFile() imageFile: Express.Multer.File) {
    return this.galleryPhotoService.updateGalleryPhoto(
      galleryPhotoId,
      imageFile,
      imageInformationDto
    );
  }

  @ApiParam({ type: String, name: "photoId", required: true })
  @Delete(":photoId/delete-gallery-photo")
  @UseGuards(UserAuthGuard)
  deleteGalleryPhoto(@RequiredParam("photoId") photoId: string) {
    return this.galleryPhotoService.deleteGalleryPhoto(photoId);
  }

  @ApiQuery({ type: String, name: "resizedImageUrl", required: true })
  @Delete("delete-resized-image")
  @UseGuards(UserAuthGuard)
  deleteResizedImage(@RequiredQuery("resizedImageUrl") resizedImageUrl: string) {
    return this.galleryPhotoService.deleteResizedImage(resizedImageUrl);
  }
}
