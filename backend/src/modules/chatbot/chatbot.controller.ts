import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotService, ChatbotDto } from './chatbot.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Chatbot')
@ApiBearerAuth()
@Controller('chatbot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CANDIDATE)
export class ChatbotController {
    constructor(private readonly chatbotService: ChatbotService) { }

    @Post('chat')
    @ApiOperation({ summary: 'Trò chuyện tương tác với AI Recruiter (RAG)' })
    async chat(@Req() req: any, @Body() dto: ChatbotDto) {
        return this.chatbotService.chat(req.user.id, dto);
    }

    @Post('suggest-by-cv')
    @ApiOperation({ summary: 'Gợi ý công việc trực tiếp từ CV của ứng viên (RAG)' })
    async suggestByCv(@Req() req: any, @Body('cvId') cvId: string) {
        return this.chatbotService.suggestByCv(req.user.id, cvId);
    }
}
