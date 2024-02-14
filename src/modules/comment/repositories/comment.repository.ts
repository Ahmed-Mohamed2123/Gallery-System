import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Comment } from "../entities/comment.entity";
import { ICreateComment } from "../interfaces/create-comment.interface";

@Injectable()
export class CommentRepository extends Repository<Comment> {

  constructor(dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

  public async getCommentsDetailsByPhotoId(galleryPhotoId: string) {
    return this.find({
      where: {
        galleryPhotoId
      },
      relations: ["user"]
    });
  }

  public async getCommentById(id: string): Promise<Comment> {
    return this.findOne({
      where: { id }
    });
  }

  public async createComment(payload: ICreateComment) {
    const createdComment = this.create(payload);
    return createdComment.save();
  }

  public async deleteCommentById(commentId: string) {
    return this.delete(commentId);
  }
}