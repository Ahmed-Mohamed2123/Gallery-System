import {
    Entity,
    Column,
    OneToMany,
    OneToOne,
    JoinColumn
} from "typeorm";
import {Profile} from "../../profile/entities/profile.entity";
import {Follow} from "../../follow/entities/follow.entity";
import {Story} from "../../story/entities/story.entity";
import {Gallery} from "../../gallery/entities/gallery.entity";
import {Hash} from "../../auth/utils/hash";
import {from, lastValueFrom, map} from "rxjs";
import {StoryView} from "../../story/entities/story-view.entity";
import {Comment} from "../../comment/entities/comment.entity";
import {UserSubscriptionDetail} from "./user-subscription-detail.entity";
import {Notification} from "../../notification/entities/notification.entity";
import {RoomMessage} from "../../room-chat/entities/room-message.entity";
import {PersonalChat} from "../../personal-chat/entities/personal-chat.entity";
import {UserJoinedRoom} from "../../room-chat/entities/user-joined-room.entity";
import {BaseDocument} from "../../../shared/database/base-document";
import {GalleryPhoto} from "../../gallery/entities/gallery-photo.entity";

@Entity("users")
export class User extends BaseDocument {
    @Column()
    username: string;

    @Column({
        nullable: true
    })
    password: string;

    @Column()
    email: string;

    @Column({
        nullable: true
    })
    salt: string;

    @Column({
        default: false
    })
    isEmailVerified: boolean;

    @Column({
        nullable: true
    })
    socialId: string;

    @Column()
    loginType: string;

    @Column({
        nullable: true
    })
    refreshToken: string;

    @Column({
        nullable: true
    })
    refreshTokenExpires: Date;

    public async validatePassword(password: string): Promise<boolean> {
        const execution$ = from(Hash.generateEncryptedPassword(password, this.salt)).pipe(
            map((encryptedPassword: string) => encryptedPassword === this.password)
        );

        return lastValueFrom(execution$);
    }

    // ** //
    @OneToOne(type => Profile, profile => profile.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    @JoinColumn()
    profile: Profile;

    @Column()
    profileId: string;

    @OneToMany(() => Follow, (follow: Follow) => follow.followerUser, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    following: Follow[];

    @OneToMany(() => Follow, (follow: Follow) => follow.followingUser, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    followers: Follow[];

    @OneToMany(type => Story, story => story.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    story: Story[];

    @OneToMany(() => StoryView, userStory => userStory.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    storyViews: StoryView[];

    @OneToMany(() => Gallery, gallery => gallery.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    gallery: Gallery[];

    @OneToMany(type => Comment, comment => comment.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    comments: Comment[];

    @OneToMany(type => Notification, notification => notification.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    notifications: Notification[];

    @OneToMany(type => RoomMessage, roomMessage => roomMessage.sender, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    groupSentMessages: RoomMessage[];

    @OneToMany(type => PersonalChat, personalChat => personalChat.senderUser, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    personalSentMessages: PersonalChat[];

    @OneToMany(type => PersonalChat, personalChat => personalChat.receiverUser, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    personalReceivedMessages: PersonalChat[];

    @OneToMany(type => UserJoinedRoom, userJoinedRoom => userJoinedRoom.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    usersJoinedRooms: UserJoinedRoom[];

    @OneToOne(type => UserSubscriptionDetail, userSubscriptionDetail => userSubscriptionDetail.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    userSubscriptionDetails: UserSubscriptionDetail;

    @OneToMany(() => GalleryPhoto, galleryPhoto => galleryPhoto.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    galleryPhotos: GalleryPhoto[];
}
