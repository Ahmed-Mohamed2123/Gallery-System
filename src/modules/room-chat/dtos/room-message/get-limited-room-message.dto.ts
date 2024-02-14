import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Validate } from "class-validator";
import { IsValidUUID } from "../../../../shared/validators/uuid-validator";

export class GetLimitedRoomMessageDto {
  @ApiProperty({
    name: "limit",
    description: "Limit",
    required: true,
    title: "Limit",
    type: Number
  })
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty({
    name: "roomId",
    title: "Room Id",
    description: "Room Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  roomId: string;
}