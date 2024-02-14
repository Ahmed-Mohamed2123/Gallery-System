import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ImageInformationDto {
  @ApiProperty({
    name: "scale",
    title: "Scale",
    description: "Scale",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  scale: number;

  @ApiProperty({
    name: "mainImageWidth",
    title: "Main Image Width",
    description: "Main Image Width",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  mainImageWidth: number;

  @ApiProperty({
    name: "mainImageHeight",
    title: "Main Image Height",
    description: "Main Image Height",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  mainImageHeight: number;

  @ApiProperty({
    name: "offsetX",
    title: "Offset X",
    description: "Offset X",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  offsetX: number = 1;

  @ApiProperty({
    name: "offsetY",
    title: "Offset Y",
    description: "Offset Y",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  offsetY: number = 1;
}