import {HttpException, HttpStatus, Injectable, NotFoundException} from "@nestjs/common";
import {concatMap, from, lastValueFrom, map, of, throwError} from "rxjs";
import {tap} from "rxjs/operators";
import {DeleteResult} from "typeorm";
import {CommentRepository} from "./repositories/comment.repository";
import {CreateCommentDto} from "./dtos/create-comment.dto";
import {GalleryPhotoService} from "../gallery/services/gallery-photo.service";
import {UserService} from "../user/services/user.service";
import {User} from "../user/entities/user.entity";
import {GalleryPhoto} from "../gallery/entities/gallery-photo.entity";
import {ICreateComment} from "./interfaces/create-comment.interface";
import {Comment} from "./entities/comment.entity";
import {CacheService} from "../../cache/services/cache.service";

@Injectable()
export class CommentService {
    constructor(private commentRepo: CommentRepository,
                private photoService: GalleryPhotoService,
                private userService: UserService,
                private cacheService: CacheService) {
    }

    public async getCommentsDetailsByGalleryPhotoId(galleryPhotoId: string) {
        const cacheKey = `${galleryPhotoId}-comment`;
        const cachedCommentStream$ = from(this.cacheService.get(cacheKey));
        const lookupStream$ = from(this.commentRepo.getCommentsDetailsByPhotoId(galleryPhotoId)).pipe(
            concatMap((comments: Comment[]) => comments ?
                from(this.cacheService.set(cacheKey, comments))
                : of([])
            )
        );

        const execution$ = cachedCommentStream$.pipe(
            concatMap((cachedComments: Comment[]) => cachedComments ? of(cachedComments) : lookupStream$)
        );

        return lastValueFrom(execution$);
    }

    public async createComment(createCommentDto: CreateCommentDto) {
        const {content, userId, galleryPhotoId} = createCommentDto;
        let userData: User;
        let galleryPhoto: GalleryPhoto;

        const userLookupStream$ = from(this.userService.getUserById(userId)).pipe(
            concatMap((userData: User) => userData ?
                of(userData) :
                throwError(() => new NotFoundException("user does not found"))
            ),
            tap((foundUserData: User) => userData = foundUserData)
        );

        const getGalleryPhotoInformationStream$ = () => concatMap(() =>
            from(this.photoService.getGalleryPhotoById(galleryPhotoId)).pipe(
                concatMap((foundGalleryPhoto: GalleryPhoto) => foundGalleryPhoto ?
                    of(foundGalleryPhoto) :
                    throwError(() => new NotFoundException("Gallery Photo Information does not found"))
                ),
                tap((foundGalleryPhoto: GalleryPhoto) => galleryPhoto = foundGalleryPhoto)
            )
        );

        const createCommentStream$ = () => concatMap(() => {
            const payload: ICreateComment = {
                user: userData,
                galleryPhoto,
                content
            };

            return from(this.commentRepo.createComment(payload));
        });

        const flushCachedGalleryPhotoCommentsStream$ = () => concatMap(() =>
            from(this.cacheService.delete(`${galleryPhoto.id}-comment`)));

        const execution$ = userLookupStream$.pipe(
            getGalleryPhotoInformationStream$(),
            createCommentStream$(),
            flushCachedGalleryPhotoCommentsStream$(),
            map(() => ({
                success: true
            }))
        );

        return lastValueFrom(execution$);
    }

    public async editComment(commentId: string, content: string): Promise<Comment> {
        let comment: Comment;

        const commentLookupStream$ = from(this.commentRepo.getCommentById(commentId)).pipe(
            concatMap((comment: Comment) =>
                comment ? of(comment) : throwError(() => new NotFoundException())
            ),
            tap((foundComment: Comment) => comment = foundComment)
        );

        const editCommentStream$ = () => concatMap(() => {
            if (content) comment.content = content;
            return from(comment.save());
        })

        const flushCachedGalleryPhotoCommentsStream$ = () => concatMap(() =>
            from(this.cacheService.delete(`${comment.galleryPhotoId}-comment`)));

        const execution$ = commentLookupStream$.pipe(
            editCommentStream$(),
            flushCachedGalleryPhotoCommentsStream$(),
            map(() => comment)
        );

        return lastValueFrom(execution$);
    }

    public async deleteComment(commentId: string) {
        let comment: Comment;

        const commentLookupStream$ = from(this.commentRepo.getCommentById(commentId)).pipe(
            concatMap((comment: Comment) =>
                comment ? of(comment) : throwError(() => new NotFoundException())
            ),
            tap((foundComment: Comment) => comment = foundComment)
        );

        const deleteCommentStream$ = () => concatMap(() =>
            from(this.commentRepo.deleteCommentById(commentId)).pipe(
                concatMap((deleteResult: DeleteResult) => {
                    if (deleteResult.affected === 0) {
                        return throwError(() => new HttpException(
                            `Unable to delete comment with id ${commentId}.`,
                            HttpStatus.UNPROCESSABLE_ENTITY,
                        ));
                    }

                    return of(deleteResult);
                })
            ));

        const flushCachedGalleryPhotoCommentsStream$ = () => concatMap(() =>
            from(this.cacheService.delete(`${comment.galleryPhotoId}-comment`)));

        const execution$ = commentLookupStream$.pipe(
            deleteCommentStream$(),
            flushCachedGalleryPhotoCommentsStream$(),
        );

        return lastValueFrom(execution$);
    }
}
