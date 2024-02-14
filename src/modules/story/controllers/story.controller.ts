import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile, UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { ApiBody, ApiHeader, ApiParam, ApiSecurity } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { StoryService } from "../services/story.service";
import { User } from "../../user/entities/user.entity";
import { AuthenticatedUser } from "../../../decorators/authenticated-user.decorator";
import { CreateUserStoryDto } from "../dtos/create-user-story.dto";
import { ImageInformationDto } from "../../../shared/dtos/image-information.dto";
import { ImageTextDto } from "../../../shared/dtos/image-text.dto";
import { LangHeader } from "../../../decorators/lang.decorator";
import { RequiredParam } from "../../../decorators/required-param.decorator";
import { ImagePath } from "../../../shared/enums/image-path.enum";
import { MulterUploader } from "../../../shared/utils/multer-uploader";
import { UserAuthGuard } from "../../../guards/user-auth.guard";

const MULTER_CONFIGURATION = {
  storage: diskStorage({
    destination: ImagePath.STORY,
    filename: MulterUploader.editFileName
  }),
  fileFilter: MulterUploader.checkValidImageExtension
};

@ApiSecurity("API-KEY")
@Controller("story")
export class StoryController {

  constructor(private storyService: StoryService) {
  }

  @Get(":userId/user-stories-details")
  getUserStoriesDetails(@RequiredParam("userId") userId: string) {
    return this.storyService.getUserStoriesDetails(userId);
  }

  @ApiBody({ type: CreateUserStoryDto })
  @Post("create-story")
  @UseGuards(UserAuthGuard)
  createUserStory(
    @AuthenticatedUser() user: User,
    @Body() createUserStoryDto: CreateUserStoryDto
  ) {
    return this.storyService.createUserStory(user, createUserStoryDto);
  }

  @ApiHeader({ name: "x-lang", required: true })
  @ApiBody({ type: ImageInformationDto, required: true, description: "Data for image information" })
  @ApiBody({ type: ImageTextDto, description: "Data for image text" })
  @Post(":storyId/upload-story-image")
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor("imageFile", MULTER_CONFIGURATION) as any)
  uploadStoryImage(@UploadedFile() selectedStoryImageFile: Express.Multer.File,
                   @RequiredParam("storyId") storyId: string,
                   @Body() bodyData: { imageInformationDto: ImageInformationDto, imageTextDto: ImageTextDto },
                   @LangHeader() lang: string
  ) {
    const { imageInformationDto, imageTextDto } = bodyData;
    return this.storyService.uploadStoryImage(
      storyId,
      selectedStoryImageFile,
      imageInformationDto,
      imageTextDto,
      lang
    );
  }

  @ApiParam({ name: "storyId", required: true, type: String })
  @Delete(":storyId/delete-user-story")
  @UseGuards(UserAuthGuard)
  deleteUserStory(
    @AuthenticatedUser() user: User,
    @RequiredParam("storyId") storyId: string
  ) {
    return this.storyService.deleteUserStory(user, storyId);
  }
}
