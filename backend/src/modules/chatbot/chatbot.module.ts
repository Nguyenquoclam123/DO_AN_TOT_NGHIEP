import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { AiEngineModule } from '../../ai-engine/ai-engine.module';
import { CvModule } from '../cv/cv.module';
import { JobModule } from '../job/job.module';

@Module({
    imports: [
        AiEngineModule,
        CvModule,
        JobModule,
    ],
    controllers: [ChatbotController],
    providers: [ChatbotService],
    exports: [ChatbotService],
})
export class ChatbotModule { }
