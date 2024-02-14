import { IsNotEmpty, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidUUID } from "../../../shared/validators/uuid-validator";

export class FollowerDto {
  @ApiProperty({
    name: "followerUserId",
    title: "Follower User Id",
    description: "Follower User Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  followerUserId: string;

  @ApiProperty({
    name: "followingUserId",
    title: "Following User Id",
    description: "Following User Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  followingUserId: string;
}