import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ImageTextDto {
  @ApiProperty({
    name: "text",
    title: "Text",
    description: "Text",
    required: true,
    type: String
  })
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    name: "textOffsetY",
    title: "Text Offset Y",
    description: "Text Offset Y",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  textOffsetY: number;

  @ApiProperty({
    name: "textOffsetX",
    title: "Text Offset X",
    description: "Text Offset X",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  textOffsetX: number;
}