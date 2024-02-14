import { Gender } from "../../profile/enums/gender.enum";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProfileDto {
  @ApiProperty({
    name: "firstname",
    title: "First Name",
    description: "First Name",
    required: false,
    type: String
  })
  @IsString()
  firstname: string;

  @ApiProperty({
    name: "lastname",
    title: "Last Name",
    description: "Last Name",
    required: false,
    type: String
  })
  @IsString()
  lastname: string;

  @ApiProperty({
    name: "gender",
    title: "Gender",
    description: "Gender",
    required: false,
    enum: Gender
  })
  @IsEnum(Gender)
  gender: string;

  @ApiProperty({
    name: "age",
    title: "Age",
    description: "Age",
    required: false,
    type: Number
  })
  @IsNumber()
  age: number;

  @ApiProperty({
    name: "country",
    title: "Country",
    description: "Country",
    required: false,
    type: String
  })
  @IsString()
  country: string;
}
