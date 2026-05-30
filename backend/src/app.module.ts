import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';
import { aiConfig } from './config/ai.config';
import { redisConfig } from './config/redis.config';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { CompanyModule } from './modules/company/company.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { JobModule } from './modules/job/job.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { CvModule } from './modules/cv/cv.module';
import { ApplicationModule } from './modules/application/application.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { TalentPoolModule } from './modules/talent-pool/talent-pool.module';
import { InterviewModule } from './modules/interview/interview.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { SettingModule } from './modules/setting/setting.module';
import { OfferModule } from './modules/offer/offer.module';
import { UploadModule } from './modules/upload/upload.module';
import { BlogModule } from './modules/blog/blog.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';

// AI Engine
import { AiEngineModule } from './ai-engine/ai-engine.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, databaseConfig, aiConfig, redisConfig]
        }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRootAsync({
            useFactory: databaseConfig,
        }),
        // Auth
        AuthModule,
        // Core
        UserModule,
        CandidateModule,
        CompanyModule,
        MasterDataModule,
        JobModule,
        CampaignModule,
        QuestionBankModule,
        CvModule,
        ApplicationModule,
        PipelineModule,
        TalentPoolModule,
        InterviewModule,
        OfferModule,
        // Real-time
        ChatModule,
        NotificationModule,
        // Admin
        AdminModule,
        SettingModule,
        UploadModule,
        BlogModule,
        // AI Engine
        AiEngineModule,
        // Chatbot (RAG)
        ChatbotModule,
    ],
})
export class AppModule { }

