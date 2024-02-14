import { Key } from "../models/key";
import { Type } from "class-transformer";
import { IsNotEmpty, IsObject, IsString, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterUserSubscriptionDetailDto {
  @ApiProperty({
    name: "endpoint",
    description: "Endpoint",
    required: true,
    title: "Endpoint",
    type: String
  })
  @IsNotEmpty()
  @IsString()
  endpoint: string;

  @ApiProperty({
    name: "keys",
    description: "Keys",
    required: true,
    title: "Keys",
    type: Key
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Key)
  keys: Key;
}