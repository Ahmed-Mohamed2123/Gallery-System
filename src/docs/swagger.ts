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
import {IModuleData} from "./interfaces/module-data.interface";

const MODULE_PATH_PREFIX = "api";

const MODULES_DATA: IModuleData[] = [
    {
        module: AppModule,
        path: `${MODULE_PATH_PREFIX}`,
        title: "App Module",
        tags: ""
    },
    {
        module: AuthModule,
        path: `${MODULE_PATH_PREFIX}/auth`,
        title: "Auth Module",
        tags: "",
    },
    {
        module: ProfileModule,
        path: `${MODULE_PATH_PREFIX}/profile`,
        title: "Profile Module",
        tags: "",
    },
    {
        module: GalleryModule,
        path: `${MODULE_PATH_PREFIX}/gallery`,
        title: "Gallery Module",
        tags: "",
    },
    {
        module: CommentModule,
        path: `${MODULE_PATH_PREFIX}/comment`,
        title: "Comment Module",
        tags: "",
    },
    {
        module: FavoriteModule,
        path: `${MODULE_PATH_PREFIX}/favorite`,
        title: "Favorite Module",
        tags: "",
    },
    {
        module: FollowModule,
        path: `${MODULE_PATH_PREFIX}/follow`,
        title: "Follow Module",
        tags: "",
    },
    {
        module: NotificationModule,
        path: `${MODULE_PATH_PREFIX}/notification`,
        title: "Notification Module",
        tags: "",
    },
    {
        module: PersonalChatModule,
        path: `${MODULE_PATH_PREFIX}/personal-chat`,
        title: "Personal Chat Module",
        tags: "",
    },
    {
        module: RoomChatModule,
        path: `${MODULE_PATH_PREFIX}/room-chat`,
        title: "Room Chat Module",
        tags: "",
    },
];

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


const buildModuleDocument = (module, path, title, description, tags) => {
    const config = buildDocument({title, description, tags});
    return {module, path, config};
};

const generateDocs = (app, modules) => {
    for (const module of modules) {
        const document = SwaggerModule.createDocument(app, module.config, {
            include: [module.module]
        });

        SwaggerModule.setup(module.path, app, document);
    }
};

const generateLinksTemplate = (baseUrl: string) => {
    let linksTemplate = `<div style="padding: 10px">`;

    for (const value of Object.values(MODULES_DATA)) {
        const {path, title} = value as IModuleData;
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

const swaggerOptionsInit = (app: NestExpressApplication, baseUrl: string) => {
    const linksTemplate = generateLinksTemplate(baseUrl);
    const modules = MODULES_DATA.map((moduleData: IModuleData) => {
        const {module, path, title, tags} = moduleData;
        return buildModuleDocument(module, path, title, linksTemplate, tags)
    });
    generateDocs(app, modules);
};


export default swaggerOptionsInit;


