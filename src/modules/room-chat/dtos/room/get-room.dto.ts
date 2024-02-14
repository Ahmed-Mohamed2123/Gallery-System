import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetRoomDto {
  @ApiProperty({
    name: "page",
    description: "Page number",
    required: true,
    title: "Page",
    type: Number
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({
    name: "limit",
    description: "Limit number",
    required: true,
    title: "Limit",
    type: Number
  })
  @IsNotEmpty()
  @IsNumber()
  limit: number;
}