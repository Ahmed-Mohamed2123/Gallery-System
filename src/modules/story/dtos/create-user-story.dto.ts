import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserStoryDto {
  @ApiProperty({
    name: "content",
    title: "Content",
    description: "Content",
    required: true,
    type: String
  })
  @IsNotEmpty()
  content: string;
}