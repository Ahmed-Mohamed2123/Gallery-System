import {CONFIG} from "../../config/config";
import {concatMap, forkJoin, from, lastValueFrom, map, of} from "rxjs";
import * as Jimp from "jimp";
import * as fs from "fs";
import * as gm from "gm";
import * as rtlText from 'bidi';
import {IGenerateTextOverlay} from "../interfaces/generate-text-overlay.interface";
import {JimpUtil} from "./jimp-util";
import {IGenerateCompositeImage} from "../interfaces/generate-composite-image.interface";
import {ImagePath} from "../enums/image-path.enum";

export class ImageProcessor {
    static async generateCompositeImage(generateCompositeImage: IGenerateCompositeImage) {
        const {
            scale,
            offsetY,
            offsetX,
            mainImageWidth,
            mainImageHeight,
            backgroundImageWidth,
            backgroundImageHeight,
            selectedImagePath,
            modifiedImagePath
        } = generateCompositeImage;
        const backgroundImagePath = `${CONFIG.SERVER_URL}/${ImagePath.PROFILE_IMAGE.substring(2)}/background-img.jpg`;
        const execution$ = forkJoin([
            from(JimpUtil.readImage(selectedImagePath)),
            from(JimpUtil.readImage(backgroundImagePath)),
        ]).pipe(
            concatMap(([imageBase, backgroundImage]) => {
                const cropMainImageStream$ = () => concatMap(() =>
                    from(JimpUtil.cropImage(
                        imageBase,
                        offsetX,
                        offsetY,
                        mainImageWidth,
                        mainImageHeight
                    )));
                const cropBackgroundImageStream$ = () => concatMap(() => from(JimpUtil.cropImage(backgroundImage,
                    0,
                    0,
                    backgroundImageWidth,
                    backgroundImageHeight,
                )));

                const mergeImagesStream$ = () => concatMap(() =>
                    from(JimpUtil.mergeImages(
                        backgroundImage,
                        imageBase,
                        offsetX < 0 ? 0 : offsetX,
                        offsetY < 0 ? 0 : offsetY
                    )));

                const uploadCompositeImageStream$ = () => concatMap((foundCompositeImage: Jimp) => {
                    return from(foundCompositeImage.writeAsync(modifiedImagePath))
                })
                const compositeImageMapperStream$ = () => map(() => ({
                    imageUrl: `${CONFIG.SERVER_URL}/${modifiedImagePath.substring(2)}`,
                    imagePath: modifiedImagePath,
                }));

                if (scale) {
                    return from(JimpUtil.scaleImage(imageBase, scale)).pipe(
                        cropMainImageStream$(),
                        cropBackgroundImageStream$(),
                        mergeImagesStream$(),
                        uploadCompositeImageStream$(),
                        compositeImageMapperStream$()
                    );
                }

                return of({}).pipe(
                    cropMainImageStream$(),
                    cropBackgroundImageStream$(),
                    mergeImagesStream$(),
                    uploadCompositeImageStream$(),
                    compositeImageMapperStream$()
                )
            })
        );

        return lastValueFrom(execution$);
    }

    static async generateImageWithTextOverlay(generateTextOverlay: IGenerateTextOverlay) {
        const {
            text, textOffsetY, textOffsetX,
            selectedImagePath, modifiedImagePath,
            textLanguage
        } = generateTextOverlay;

        if (!fs.existsSync(selectedImagePath)) {
            throw new Error('Invalid input data');
        }

        try {
            const selectedFontFileName = textLanguage === 'ar' ? "ArabicFont.ttf" : "EnglishFont.ttf";
            const shapedText = rtlText(text).unicode();

            const drawTextStream$ = from(gm(selectedImagePath)
                .fill('#FFF')
                .font(selectedFontFileName, 45)
                .drawText(textOffsetX, textOffsetY, shapedText)
                .writeAsync(modifiedImagePath));

            const execution$ = drawTextStream$.pipe(
                map(() => `${CONFIG.SERVER_URL}/${modifiedImagePath}`)
            );

            return lastValueFrom(execution$);
        } catch (err) {
            throw new Error('Something went wrong');
        }
    }
}
