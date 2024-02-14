import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class Key {
  @ApiProperty({
    name: "auth",
    title: "Auth",
    description: "Auth",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  auth: string;

  @ApiProperty({
    name: "p256dh",
    title: "p256dh",
    description: "p256dh",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  p256dh: string;
}