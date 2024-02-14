import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AuthCredentialsDto {
  @ApiProperty({
    name: "username",
    title: "Username",
    description: "Username",
    required: false,
    type: String
  })
  @IsString()
  username: string;

  @ApiProperty({
    name: "email",
    title: "Email",
    description: "Email",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    name: "password",
    title: "Password",
    description: "Password",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
