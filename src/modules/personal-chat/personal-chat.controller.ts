import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiSecurity } from "@nestjs/swagger";
import { PersonalChatService } from "./personal-chat.service";
import { GetLimitedPersonalChatMessageDto } from "./dtos/get-limited-personal-chat-message.dto";
import { UserAuthGuard } from "../../guards/user-auth.guard";

@ApiSecurity("API-KEY")
@Controller("personal-chat")
@UseGuards(UserAuthGuard)
export class PersonalChatController {
  constructor(private personalChatService: PersonalChatService) {
  }

  @ApiBody({ type: GetLimitedPersonalChatMessageDto, required: true })
  @Post("limited-personal-chat-messages")
  getLimitedPersonalChatMessages(
    @Body() getLimitedPersonalChatMessageDto: GetLimitedPersonalChatMessageDto
  ) {
    return this.personalChatService.getLimitedPersonalChatMessages(getLimitedPersonalChatMessageDto);
  }
}