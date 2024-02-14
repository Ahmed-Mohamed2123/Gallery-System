import {
    Body,
    Controller,
    Get,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {ApiBody, ApiParam, ApiQuery, ApiSecurity} from "@nestjs/swagger";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {ProfileService} from "./profile.service";
import {AuthenticatedUser} from "../../decorators/authenticated-user.decorator";
import {User} from "../user/entities/user.entity";
import {UserAuthGuard} from "../../guards/user-auth.guard";
import {CreateProfileDto} from "../auth/dtos/create-profile.dto";
import {ImageInformationDto} from "../../shared/dtos/image-information.dto";
import {RequiredParam} from "../../decorators/required-param.decorator";
import {ImagePath} from "../../shared/enums/image-path.enum";
import {MulterUploader} from "../../shared/utils/multer-uploader";

const MULTER_CONFIGURATION = {
    storage: diskStorage({
        destination: ImagePath.PROFILE_IMAGE,
        filename: MulterUploader.editFileName
    }),
    fileFilter: MulterUploader.checkValidImageExtension
};

@ApiSecurity("API-KEY")
@Controller("profile")
export class ProfileController {
    constructor(private profileService: ProfileService) {
    }

    @Get("")
    @UseGuards(UserAuthGuard)
    getProfileData(@AuthenticatedUser() user: User) {
        return this.profileService.getProfileById(user.profileId);
    }

    @ApiParam({name: "userId", type: Number, required: true})
    @Get(":userId")
    getProfileByUserId(@RequiredParam("userId") userId: string) {
        return this.profileService.getProfileByUserId(userId);
    }

    @ApiQuery({type: ImageInformationDto, required: true})
    @Put("change-profile-image")
    @UseGuards(UserAuthGuard)
    @UseInterceptors(FileInterceptor("imageFile", MULTER_CONFIGURATION) as any)
    changeProfileImage(@AuthenticatedUser() user: User,
                       @Query() imageInformationDto: ImageInformationDto,
                       @UploadedFile() selectedMainImageFile: Express.Multer.File) {
        return this.profileService.changeProfileImage(
            user,
            selectedMainImageFile,
            imageInformationDto
        );
    }

    @ApiQuery({type: ImageInformationDto, required: true})
    @Put("change-profile-background-image")
    @UseGuards(UserAuthGuard)
    @UseInterceptors(FileInterceptor("imageFile", MULTER_CONFIGURATION) as any)
    changeBackgroundProfileImage(@AuthenticatedUser() user: User,
                                 @Query() imageInformationDto: ImageInformationDto,
                                 @UploadedFile() selectedBackgroundImageFile: Express.Multer.File) {
        return this.profileService.changeProfileBackgroundImage(
            user,
            selectedBackgroundImageFile,
            imageInformationDto
        );
    }

    @ApiBody({type: CreateProfileDto, required: true})
    @Put("edit-profile")
    @UseGuards(UserAuthGuard)
    editProfile(@AuthenticatedUser() user: User,
                @Body() createProfileDto: CreateProfileDto) {
        return this.profileService.editProfile(user, createProfileDto);
    }
}
