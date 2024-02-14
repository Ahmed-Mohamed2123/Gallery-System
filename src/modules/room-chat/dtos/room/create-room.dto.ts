import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoomDto {
  @ApiProperty({
    name: "name",
    description: "The name of the room",
    required: true,
    title: "Name",
    type: String
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    name: "description",
    description: "Description",
    required: true,
    title: "Description",
    type: String
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}