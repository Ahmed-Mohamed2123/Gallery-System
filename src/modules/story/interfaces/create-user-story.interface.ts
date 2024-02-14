import {User} from "../../user/entities/user.entity";
import {StoryView} from "../entities/story-view.entity";

export interface ICreateUserStory {
    content: string;
    user: User;
    storyViews: StoryView[];
}