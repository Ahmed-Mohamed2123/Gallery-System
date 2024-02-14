import {User} from "../../../user/entities/user.entity";

export interface ICreateGallery {
    user: User;
    name: string;
}