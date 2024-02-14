import * as Jimp from "jimp";

export class JimpUtil {
    static async readImage(imagePath: string): Promise<Jimp> {
        return Jimp.read(imagePath);
    }

    static async scaleImage(loadedImage: Jimp, scale: number): Promise<Jimp> {
        return loadedImage.scale(scale);
    }

    static async resizeImage(loadedImage: Jimp, width: number, height: number): Promise<Jimp> {
        return loadedImage.resize(width, height);
    }

    static async cropImage(loadedImage: Jimp, x: number, y: number, width: number, height: number): Promise<Jimp> {
        return loadedImage.crop(x, y, width, height);
    }

    static async mergeImages(loadedBackgroundImage: Jimp, imageBase: Jimp, offsetX: number, offsetY: number): Promise<Jimp> {
        return loadedBackgroundImage.blit(imageBase, offsetX, offsetY);
    }
}