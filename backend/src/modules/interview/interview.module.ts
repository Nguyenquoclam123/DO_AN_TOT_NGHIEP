import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './entities/interview.entity';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { Application } from '../application/entities/application.entity';
import { ApplicationStatusHistory } from '../application/entities/application-status-history.entity';
import { User } from '../user/entities/user.entity';
import { ApplicationModule } from '../application/application.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Interview]),
        NotificationModule,
        ApplicationModule
    ],
    controllers: [InterviewController],
    providers: [InterviewService],
    exports: [InterviewService, TypeOrmModule],
})
export class InterviewModule { }
