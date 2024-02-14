import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MulterModule} from "@nestjs/platform-express";
import {StoryService} from "./services/story.service";
import {StoryController} from "./controllers/story.controller";
import {StoryRepository} from "./repositories/story.repository";
import {UserModule} from "../user/user.module";
import {Story} from "./entities/story.entity";
import {ImagePath} from "../../shared/enums/image-path.enum";
import {ScheduleModule} from "@nestjs/schedule";
import {StoryView} from "./entities/story-view.entity";
import {StoryViewService} from "./services/story-view.service";
import {StoryViewRepository} from "./repositories/story-view.repository";
import {StoryViewController} from "./controllers/story-view.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Story,
            StoryView
        ]),
        MulterModule.register({
            dest: ImagePath.STORY
        }),
        UserModule,
        ScheduleModule
    ],
    providers: [
        StoryService,
        StoryViewService,
        StoryRepository,
        StoryViewRepository
    ],
    controllers: [
        StoryController,
        StoryViewController
    ],
    exports: [
        StoryService
    ]
})
export class StoryModule {
}
