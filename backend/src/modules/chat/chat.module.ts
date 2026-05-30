import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ChatRoom, Message])],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService, TypeOrmModule],
})
export class ChatModule { }
