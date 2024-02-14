import {Controller, Get, Post, Query, UseGuards} from "@nestjs/common";
import {ApiBody, ApiParam, ApiQuery, ApiSecurity} from "@nestjs/swagger";
import {RoomChatService} from "./services/room-chat.service";
import {GetRoomDto} from "./dtos/room/get-room.dto";
import {CreateRoomDto} from "./dtos/room/create-room.dto";
import {UserJoinedRoomService} from "./services/user-joined-room.service";
import {GetLimitedRoomMessageDto} from "./dtos/room-message/get-limited-room-message.dto";
import {RequiredQuery} from "../../decorators/required-query.decorator";
import {UserAuthGuard} from "../../guards/user-auth.guard";

@ApiSecurity("API-KEY")
@Controller("room")
@UseGuards(UserAuthGuard)
export class RoomChatController {
    constructor(private roomService: RoomChatService,
                private UserJoinedRoomService: UserJoinedRoomService) {
    }

    @ApiQuery({type: GetRoomDto, required: true})
    @Get("rooms")
    getRooms(
        @Query() getRoomDto: GetRoomDto
    ) {
        return this.roomService.getRooms(getRoomDto);
    }

    @ApiParam({name: "roomId", type: String, required: true})
    @Get(":roomId/users-into-room")
    getUsersIntoRoom(
        @RequiredQuery("roomId") roomId: string
    ) {
        return this.UserJoinedRoomService.getUsersIntoRoom(roomId);
    }

    @ApiQuery({type: GetLimitedRoomMessageDto, required: true})
    @Get("limited-room-messages")
    getLimitedRoomMessages(
        @Query() getLimitedRoomMessageDto: GetLimitedRoomMessageDto
    ) {
        return this.roomService.getLimitedRoomMessages(getLimitedRoomMessageDto);
    }

    @ApiBody({type: CreateRoomDto, required: true})
    @Post("create-room")
    createRoom(
        @Query() createRoomDto: CreateRoomDto
    ) {
        return this.roomService.createRoom(createRoomDto);
    }
}