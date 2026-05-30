import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobSkill } from './entities/job-skill.entity';
import { JobRequirement } from './entities/job-requirement.entity';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { AiEngineModule } from '../../ai-engine/ai-engine.module';
import { CampaignModule } from '../campaign/campaign.module';
import { QuestionBankModule } from '../question-bank/question-bank.module';
import { QuestionSet } from '../question-bank/entities/question.entity';
import { NotificationModule } from '../notification/notification.module';
import { Candidate } from '../candidate/entities/candidate.entity';

import { JobCategory } from './entities/job-category.entity';
import { FavoriteJob } from './entities/favorite-job.entity';
import { FavoriteCategory } from './entities/favorite-category.entity';
import { JobFavoriteService } from './job-favorite.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobSkill, JobRequirement, JobCategory, QuestionSet, Candidate, FavoriteJob, FavoriteCategory]),
    forwardRef(() => AiEngineModule),
    CampaignModule,
    QuestionBankModule,
    NotificationModule,
  ],
  controllers: [JobController],
  providers: [JobService, JobFavoriteService],
  exports: [JobService, JobFavoriteService, TypeOrmModule],
})
export class JobModule { }
