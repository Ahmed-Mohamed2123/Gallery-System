import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {NestExpressApplication} from "@nestjs/platform-express";
import {AppModule} from "../app.module";
import {AuthModule} from "../modules/auth/auth.module";
import {GalleryModule} from "../modules/gallery/gallery.module";
import {CommentModule} from "../modules/comment/comment.module";
import {FavoriteModule} from "../modules/favorite/favorite.module";
import {PersonalChatModule} from "../modules/personal-chat/personal-chat.module";
import {NotificationModule} from "../modules/notification/notification.module";
import {FollowModule} from "../modules/follow/follow.module";
import {RoomChatModule} from "../modules/room-chat/room-chat.module";
import {ProfileModule} from "../modules/profile/profile.module";

const MODULE_PATH_PREFIX = "api";

const moduleRoutesConfigurations = {
    "root": {
        path: `${MODULE_PATH_PREFIX}`,
        title: "App Module"
    },
    "auth": {
        path: `${MODULE_PATH_PREFIX}/auth`,
        title: "Auth Module"
    },
    "profile": {
        path: `${MODULE_PATH_PREFIX}/profile`,
        title: "Profile Module"
    },
    "gallery": {
        path: `${MODULE_PATH_PREFIX}/gallery`,
        title: "Gallery Module"
    },
    "comment": {
        path: `${MODULE_PATH_PREFIX}/comment`,
        title: "Comment Module"
    },
    "favorite": {
        path: `${MODULE_PATH_PREFIX}/favorite`,
        title: "Favorite Module"
    },
    "follow": {
        path: `${MODULE_PATH_PREFIX}/follow`,
        title: "Follow Module"
    },
    "notification": {
        path: `${MODULE_PATH_PREFIX}/notification`,
        title: "Notification Module"
    },
    "personalChat": {
        path: `${MODULE_PATH_PREFIX}/personal-chat`,
        title: "Personal Chat Module"
    },
    "roomChat": {
        path: `${MODULE_PATH_PREFIX}/room-chat`,
        title: "Room Chat Module"
    }
};

const generateLinksTemplate = (urlsInfo, baseUrl) => {
    let linksTemplate = `<div style="padding: 10px">`;

    for (const value of Object.values(urlsInfo)) {
        const {path, title} = value as Record<string, any>;
        linksTemplate += `
            <p>
                <a href="${baseUrl}/${path}" style="text-decoration: none">
                    ${title}
                </a>
            </p>`;
    }

    linksTemplate += `</div>`;
    return linksTemplate;
};

const buildModuleDocument = (module, path, title, description, tags) => {
    const config = buildDocument({title, description, tags});
    return {module, path, config};
};

const buildDocument = (data) => {
    const {title, description, tags} = data;
    return new DocumentBuilder()
        .setTitle(title)
        .setDescription(description)
        .setVersion("1.0")
        .addTag(tags)
        .addBearerAuth(
            {type: "http", scheme: "bearer", bearerFormat: "JWT"},
            "Authorization"
        )
        .addSecurity(
            "API-KEY", {type: "apiKey", name: "API-KEY", in: "header"}
        )
        .build();
};

const generateDocs = (app, modules) => {
    for (const module of modules) {
        const document = SwaggerModule.createDocument(app, module.config, {
            include: [module.module]
        });
        SwaggerModule.setup(module.path, app, document);
    }
};

const swaggerOptionsInit = (app: NestExpressApplication, baseUrl: string) => {
    const linksTemplate = generateLinksTemplate(moduleRoutesConfigurations, baseUrl);
    const {
        root,
        auth,
        profile,
        favorite,
        comment,
        follow,
        gallery,
        notification,
        personalChat,
        roomChat
    } = moduleRoutesConfigurations;
    const modules = [
        buildModuleDocument(AppModule, root.path, root.title, linksTemplate, ""),
        buildModuleDocument(AuthModule, auth.path, auth.title, linksTemplate, ""),
        buildModuleDocument(ProfileModule, profile.path, profile.title, linksTemplate, ""),
        buildModuleDocument(GalleryModule, gallery.path, gallery.title, linksTemplate, ""),
        buildModuleDocument(CommentModule, comment.path, comment.title, linksTemplate, ""),
        buildModuleDocument(FavoriteModule, favorite.path, favorite.title, linksTemplate, ""),
        buildModuleDocument(FollowModule, follow.path, follow.title, linksTemplate, ""),
        buildModuleDocument(NotificationModule, notification.path, notification.title, linksTemplate, ""),
        buildModuleDocument(PersonalChatModule, personalChat.path, personalChat.title, linksTemplate, ""),
        buildModuleDocument(RoomChatModule, roomChat.path, roomChat.title, linksTemplate, "")
    ];

    generateDocs(app, modules);
};

export default swaggerOptionsInit;
