import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Validate } from "class-validator";
import { IsValidUUID } from "../../../shared/validators/uuid-validator";

export class GetLimitedPersonalChatMessageDto {
  @ApiProperty({
    name: "limit",
    title: "Limit",
    description: "Limit",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty({
    name: "senderUserId",
    title: "Sender Id",
    description: "Sender User Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  senderUserId: string;

  @ApiProperty({
    name: "receiverUserId",
    title: "Receiver Id",
    description: "Receiver User Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  receiverUserId: string;
}