import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { Job } from '../job/entities/job.entity';
import { CandidateCv } from '../cv/entities/candidate-cv.entity';
import { AiEngineModule } from '../../ai-engine/ai-engine.module';
import { AppAnswer } from './entities/app-answer.entity';
import { ApplicationHistory } from './entities/application-history.entity';
import { User } from '../user/entities/user.entity';
import { ApplicationStatusHistory } from './entities/application-status-history.entity';
import { ApplicationPipelineStep } from './entities/pipeline-step.entity';
import { NotificationModule } from '../notification/notification.module';
import { Candidate } from '../candidate/entities/candidate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Job,
      CandidateCv,
      AppAnswer,
      ApplicationHistory,
      ApplicationStatusHistory,
      ApplicationPipelineStep,
      Candidate,
      User
    ]),
    AiEngineModule,
    NotificationModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService, TypeOrmModule],
})
export class ApplicationModule { }
