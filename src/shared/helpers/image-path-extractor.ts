export function extractImagePath(imageUrl: string) {
    let urlObject = new URL(imageUrl);

    return urlObject.pathname;
}