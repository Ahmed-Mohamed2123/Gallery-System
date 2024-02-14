import {join} from "path";
import {NestExpressApplication} from "@nestjs/platform-express";
import {ImagePath} from "../shared/enums/image-path.enum";

export function configureStaticFolders(app: NestExpressApplication): void {
    const baseFolderPath = join(__dirname, "..");
    const removeFirstDot = (str: string) => str.charAt(0) === "." ? str.slice(1) : str;

    const staticImagesFolders = [
        {path: ImagePath.GALLERY, prefix: `${removeFirstDot(ImagePath.GALLERY)}/`},
        {path: ImagePath.GALLERY_PHOTO, prefix: `${removeFirstDot(ImagePath.GALLERY_PHOTO)}/`},
        {path: ImagePath.PROFILE_IMAGE, prefix: `${removeFirstDot(ImagePath.PROFILE_IMAGE)}/`},
        {path: ImagePath.STORY, prefix: `${removeFirstDot(ImagePath.STORY)}/`}
    ];

    staticImagesFolders.forEach(folder => {
        const {path, prefix} = folder;
        app.useStaticAssets(join(baseFolderPath, path), {
            prefix
        });
    });
}