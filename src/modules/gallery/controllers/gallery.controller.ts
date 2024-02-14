import {
  Body,
  Controller,
  Delete, Get, Param,
  ParseIntPipe, Post,
  Put,
  Query,
  UploadedFile, UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ApiBody, ApiParam, ApiProperty, ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { GalleryService } from "../services/gallery.service";
import { CreateGalleryDto } from "../dtos/gallery/create-gallery.dto";
import { GetUserGalleryDto } from "../dtos/gallery/get-user-gallery.dto";
import { ImageInformationDto } from "../../../shared/dtos/image-information.dto";
import { UserAuthGuard } from "../../../guards/user-auth.guard";
import { RequiredParam } from "../../../decorators/required-param.decorator";
import { MulterUploader } from "../../../shared/utils/multer-uploader";
import { ImagePath } from "../../../shared/enums/image-path.enum";

const MULTER_CONFIGURATION = {
  storage: diskStorage({
    destination: ImagePath.GALLERY,
    filename: MulterUploader.editFileName
  }),
  fileFilter: MulterUploader.checkValidImageExtension
};

@ApiSecurity("API-KEY")
@Controller("gallery")
export class GalleryController {
  constructor(private galleryService: GalleryService) {
  }

  @ApiParam({ name: "galleryId", required: true, type: String })
  @Get(":galleryId")
  getById(@RequiredParam("galleryId") galleryId: string) {
    return this.galleryService.getGalleryListByGalleryId(galleryId);
  }

  @ApiBody({ type: GetUserGalleryDto })
  @Get("galleries")
  getGalleryPhotos(@Query() getGalleryPhotoDto: GetUserGalleryDto) {
    return this.galleryService.getUserGalleries(getGalleryPhotoDto);
  }

  @ApiBody({ type: CreateGalleryDto })
  @Post("create-gallery")
  @UseGuards(UserAuthGuard)
  createGallery(@Body() createGalleryDto: CreateGalleryDto) {
    return this.galleryService.createGallery(createGalleryDto);
  }

  @ApiParam({ name: "galleryId", required: true, type: String })
  @ApiBody({ type: ImageInformationDto })
  @Post(":galleryId/upload-gallery-photo")
  @UseInterceptors(FileInterceptor("galleryPhotoFile", MULTER_CONFIGURATION) as any)
  uploadGalleryPhoto(
    @UploadedFile() galleryPhotoFile: Express.Multer.File,
    @RequiredParam("galleryId") galleryId: string,
    @Body() imageInformationDto: ImageInformationDto
  ) {
    return this.galleryService.uploadGalleryPhoto(
      galleryId,
      galleryPhotoFile,
      imageInformationDto
    );
  }

  @ApiProperty({ type: String, name: "name" })
  @ApiQuery({ type: ImageInformationDto })
  @Put(":galleryId/update-gallery")
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor("galleryPhotoFile", MULTER_CONFIGURATION) as any)
  updateUserGalleryCollection(@RequiredParam("galleryId") galleryId: string,
                              @Body("name") name: string,
                              @Query() imageInformationDto: ImageInformationDto,
                              @UploadedFile() galleryPhotoFile: Express.Multer.File) {
    return this.galleryService.updateUserGalleryCollection(
      galleryId,
      name,
      galleryPhotoFile,
      imageInformationDto
    );
  }

  @ApiParam({ name: "galleryId", required: true, type: Number })
  @Delete(":galleryId/delete-gallery")
  @UseGuards(UserAuthGuard)
  deleteGallery(@RequiredParam("galleryId", ParseIntPipe) galleryId: number) {
    return this.galleryService.deleteGallery(galleryId);
  }
}
