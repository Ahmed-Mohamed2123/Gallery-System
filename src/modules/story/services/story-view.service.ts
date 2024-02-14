import {Injectable} from "@nestjs/common";
import {from, lastValueFrom, map} from "rxjs";
import {User} from "../../user/entities/user.entity";
import {StoryViewRepository} from "../repositories/story-view.repository";
import {IRegisterStoryView} from "../interfaces/register-story-view.interface";
import {IFilterUserStoryViewCount} from "../interfaces/filter-user-story-view-count.interface";

@Injectable()
export class StoryViewService {
    constructor(private storyViewRepository: StoryViewRepository) {
    }

    public async checkIfUserViewedStory(storyId: string, user: User): Promise<boolean> {
        const payload: IFilterUserStoryViewCount = {
            storyId,
            userId: user.id
        };
        const userStoryViewsCountStream$ = from(this.storyViewRepository.getUserStoryViewsCount(payload));

        const execution$ = userStoryViewsCountStream$.pipe(
            map((count: number) => !!count)
        );

        return lastValueFrom(execution$);
    }

    public async registerStoryView(storyId: string, user: User) {
        const payload: IRegisterStoryView = {
            userId: user.id,
            storyId
        };

        return this.storyViewRepository.registerStoryView(payload);
    }
}
