import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {NestExpressApplication} from "@nestjs/platform-express";
import {ConfigService} from "@nestjs/config";
import {ValidationPipe} from "@nestjs/common";
import helmet from 'helmet';
import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';
import * as session from "express-session";
import {configureStaticFolders} from "./helpers/static-asset-folder-handler";
import swaggerOptionsInit from "./docs/swagger";

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule
    );

    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    app.use(helmet());
    const configService = app.get(ConfigService);
    const baseUrl = configService.get("SERVER_URL");

    app.use(
        session({
            secret: configService.get("SESSION_SECRET_KEY"),
            resave: false,
            saveUninitialized: false
        })
    );
    app.use(cookieParser());
    app.use(csurf({cookie: true}));

    configureStaticFolders(app);
    swaggerOptionsInit(app, baseUrl);

    const port: number = parseInt(`${process.env.PORT}`) || 3000;
    await app.listen(port);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}

bootstrap();
