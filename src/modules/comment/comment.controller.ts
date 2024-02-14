import {Body, Controller, Delete, Get, Post, Put} from "@nestjs/common";
import {ApiBody, ApiParam, ApiQuery, ApiSecurity} from "@nestjs/swagger";
import {CommentService} from "./comment.service";
import {CreateCommentDto} from "./dtos/create-comment.dto";
import {RequiredQuery} from "../../decorators/required-query.decorator";
import {RequiredParam} from "../../decorators/required-param.decorator";

@ApiSecurity("API-KEY")
@Controller("comment")
export class CommentController {
    constructor(private commentService: CommentService) {
    }

    @ApiQuery({type: String, required: true, name: "photoId"})
    @Get("comments-details")
    getCommentsDetails(@RequiredQuery("galleryPhotoId") galleryPhotoId: string) {
        return this.commentService.getCommentsDetailsByGalleryPhotoId(galleryPhotoId);
    }

    @ApiBody({type: CreateCommentDto, required: true})
    @Post("create-comment")
    createComment(@Body() createCommentDto: CreateCommentDto) {
        return this.commentService.createComment(createCommentDto);
    }

    @ApiParam({name: "commentId", type: String, required: true})
    @ApiBody({schema: {type: "object", properties: {content: {type: "string"}}, required: ["content"]}})
    @Put(":commentId/edit-comment")
    editComment(@RequiredParam("commentId") commentId: string,
                @Body("content") content: string
    ) {
        return this.commentService.editComment(commentId, content);
    }

    @ApiParam({type: String, required: true, name: "commentId"})
    @Delete(":commentId/delete-comment")
    deleteComment(@RequiredParam("commentId") commentId: string) {
        return this.commentService.deleteComment(commentId);
    }
}
