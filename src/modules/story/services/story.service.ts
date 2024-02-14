import {Injectable, NotFoundException} from "@nestjs/common";
import {concatMap, from, lastValueFrom, map, of, throwError} from "rxjs";
import {tap} from "rxjs/operators";
import {SchedulerRegistry} from "@nestjs/schedule";
import {CronJob} from "cron";
import {Story} from "../entities/story.entity";
import {StoryRepository} from "../repositories/story.repository";
import {UserService} from "../../user/services/user.service";
import {User} from "../../user/entities/user.entity";
import {ICreateUserStory} from "../interfaces/create-user-story.interface";
import {CreateUserStoryDto} from "../dtos/create-user-story.dto";
import {ImageInformationDto} from "../../../shared/dtos/image-information.dto";
import {IGenerateCompositeImage} from "../../../shared/interfaces/generate-composite-image.interface";
import {ImageProcessor} from "../../../shared/utils/image-processor";
import {FileOperation} from "../../../utils/file-operation";
import {extractImagePath} from "../../../shared/helpers/image-path-extractor";
import {ImageTextDto} from "../../../shared/dtos/image-text.dto";
import {IGenerateTextOverlay} from "../../../shared/interfaces/generate-text-overlay.interface";
import {ObjectParser} from "../../../shared/utils/object-parser";
import {DateUtil} from "../../../shared/utils/date-util";
import {generateRandomFilename} from "../../../shared/helpers/file-name-generator";
import {ImagePath} from "../../../shared/enums/image-path.enum";
import {StoryViewRepository} from "../repositories/story-view.repository";

@Injectable()
export class StoryService {
    constructor(private storyRepo: StoryRepository,
                private storyViewRepository: StoryViewRepository,
                private userService: UserService,
                private schedulerRegistry: SchedulerRegistry) {
    }

    public async getUserStoriesDetails(userId: string) {
        return this.storyRepo.getStoriesDetailsByUserId(userId);
    }

    public async createUserStory(
        user: User,
        createUserStoryDto: CreateUserStoryDto
    ) {
        const {content} = createUserStoryDto;
        let createdStory: Story;

        const userStoryCreationPayload: ICreateUserStory = {
            user,
            content,
            storyViews: []
        };
        const userStoryCreationStream$ = from(this.storyRepo.createUserStory(userStoryCreationPayload)).pipe(
            tap(story => createdStory = story)
        );

        const scheduleStoryDeletionCronJobStream$ = () => concatMap(() => {
            const storyId = createdStory.id;
            const cronJobName = `${storyId}-${new Date().getTime()}`;
            const startAt = DateUtil.toMoment(new Date());
            startAt.add(1, "day");
            const submitJob: CronJob = new CronJob(startAt.toDate(), async () => {
                await this.deleteUserStory(user, storyId);
                this.schedulerRegistry.deleteCronJob(cronJobName);
            });
            this.schedulerRegistry.addCronJob(cronJobName, submitJob);
            submitJob.start();

            return of({});
        });

        const execution$ = userStoryCreationStream$.pipe(
            scheduleStoryDeletionCronJobStream$(),
            map(() => createdStory)
        );

        return lastValueFrom(execution$);
    }

    public async uploadStoryImage(
        storyId: string,
        selectedStoryImageFile: Express.Multer.File,
        imageInformationDto: ImageInformationDto,
        imageTextDto: ImageTextDto,
        lang: string
    ) {
        const {
            scale,
            mainImageWidth,
            mainImageHeight,
            offsetX,
            offsetY
        } = ObjectParser.parseValuesToFloat(imageInformationDto);
        const {text, textOffsetY, textOffsetX} = ObjectParser.parseValuesToFloat(imageTextDto);
        const selectedStoryImagePath = selectedStoryImageFile.path;
        let imageWithTextOverlayUrl: string;
        let compositeImageUrl: string;
        let compositeImagePath: string;
        let storyData: Story;

        const storyLookupStream$ = from(this.storyRepo.getStoryById(storyId)).pipe(
            concatMap((foundStory: Story) => foundStory ?
                of(foundStory) :
                throwError(() => new NotFoundException("Story does not found"))
            ),
            tap((foundStory: Story) => storyData = foundStory)
        );

        const generateCompositeImageStream$ = () => concatMap(() => {
            const fileName = generateRandomFilename();
            const generateCompositeImagePayload: IGenerateCompositeImage = {
                scale,
                mainImageWidth,
                mainImageHeight,
                backgroundImageWidth: 400,
                backgroundImageHeight: 600,
                offsetX,
                offsetY,
                selectedImagePath: selectedStoryImagePath,
                modifiedImagePath: `${ImagePath.STORY}/${fileName}.jpeg`
            };

            return from(ImageProcessor.generateCompositeImage(generateCompositeImagePayload)).pipe(
                tap(({imageUrl, imagePath}) => {
                    compositeImageUrl = imageUrl;
                    compositeImagePath = imagePath;
                })
            );
        });

        const generateImageWithTextOverlayStream$ = () => concatMap(() => {
            const fileName = generateRandomFilename();
            const payload: IGenerateTextOverlay = {
                text,
                textLanguage: lang,
                textOffsetY,
                textOffsetX,
                selectedImagePath: compositeImagePath,
                modifiedImagePath: `${ImagePath.STORY}/${fileName}.jpeg`
            };
            return from(ImageProcessor.generateImageWithTextOverlay(payload)).pipe(
                tap(imageUrl => imageWithTextOverlayUrl = imageUrl)
            );
        });

        const deleteSelectedImageStream$ = () => concatMap(() => from(FileOperation.deleteFile(selectedStoryImagePath)));
        const deleteCompositeImageStream$ = () => concatMap(() => from(FileOperation.deleteFile(compositeImagePath)));

        const setStoryImageStream$ = () => concatMap(() => {
            storyData.imageUrl = imageWithTextOverlayUrl ?? compositeImageUrl;

            return from(storyData.save());
        });

        const execution$ = storyLookupStream$.pipe(
            generateCompositeImageStream$(),
            deleteSelectedImageStream$(),
            concatMap(() => {
                const hasNoImageTextOverlay = Object.keys(imageTextDto).length === 0;
                if (hasNoImageTextOverlay) {
                    return of({}).pipe(
                        setStoryImageStream$()
                    );
                }

                return of({}).pipe(
                    generateImageWithTextOverlayStream$(),
                    deleteCompositeImageStream$(),
                    setStoryImageStream$()
                );
            })
        );

        return lastValueFrom(execution$);
    }

    public async deleteUserStory(user: User, storyId: string) {
        let story: Story;
        const storyLookupStream$ = from(this.storyRepo.getUserStory(storyId, user.id)).pipe(
            concatMap((story: Story) =>
                story ? of(story) : throwError(() => new NotFoundException("User story does not found"))
            ),
            tap((foundStory: Story) => story = foundStory)
        );

        const deleteStoryViewersStream$ = () => concatMap(() =>
            from(this.storyViewRepository.deleteStoryViewersByStoryId(storyId))
        );

        const deleteStoryImageFileStream$ = (storyImageUrl: string) => concatMap(() => {
            const imagePath = extractImagePath(storyImageUrl);
            return from(FileOperation.deleteFile(imagePath));
        });

        const deleteStoryStream$ = () => concatMap(() => from(this.storyRepo.deleteStory(storyId)));

        const execution$ = storyLookupStream$.pipe(
            deleteStoryViewersStream$(),
            concatMap(() => {
                const {imageUrl} = story;
                if (imageUrl) {
                    return of({}).pipe(
                        deleteStoryImageFileStream$(imageUrl),
                        deleteStoryStream$()
                    );
                }

                return of({}).pipe(
                    deleteStoryStream$()
                );
            })
        );

        return lastValueFrom(execution$);
    }

}
