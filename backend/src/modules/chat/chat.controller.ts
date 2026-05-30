import { Controller, Post, Body, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateChatRoomDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('rooms')
    @ApiOperation({ summary: 'Find or create a chat room' })
    findOrCreateRoom(@Body() dto: CreateChatRoomDto) {
        return this.chatService.findOrCreateRoom(dto);
    }

    @Get('my-rooms')
    @ApiOperation({ summary: 'Get all my chat rooms' })
    getMyRooms(@Req() req: any) {
        const userId = req.user.role === 'EMPLOYER' ? req.user.companyId : req.user.id;
        return this.chatService.getMyRooms(userId, req.user.role);
    }

    @Post('messages')
    @ApiOperation({ summary: 'Send a new message' })
    sendMessage(@Req() req: any, @Body() dto: SendMessageDto) {
        return this.chatService.sendMessage(req.user.id, dto);
    }

    @Get('rooms/:id/messages')
    @ApiOperation({ summary: 'Get all messages in a room' })
    getMessages(@Param('id', ParseUUIDPipe) id: string) {
        return this.chatService.getMessagesByRoom(id);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get total unread messages count' })
    getUnreadCount(@Req() req: any) {
        const userId = req.user.role === 'EMPLOYER' ? req.user.companyId : req.user.id;
        return this.chatService.getUnreadCount(userId, req.user.role === 'EMPLOYER');
    }

    @Post('rooms/:id/read')
    @ApiOperation({ summary: 'Mark all messages in a room as read' })
    markAsRead(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
        const userId = req.user.role === 'EMPLOYER' ? req.user.companyId : req.user.id;
        return this.chatService.markAsRead(id, userId);
    }
}
