import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateCv } from './entities/candidate-cv.entity';
import { CvExperience } from './entities/cv-experience.entity';
import { CvEducation } from './entities/cv-education.entity';
import { CvSkill } from './entities/cv-skill.entity';
import { CvProject } from './entities/cv-project.entity';
import { CvCertification } from './entities/cv-certification.entity';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { AiEngineModule } from '../../ai-engine/ai-engine.module';
import { Job } from '../job/entities/job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateCv, CvExperience, CvEducation, CvSkill, CvProject, CvCertification, Job]),
    forwardRef(() => AiEngineModule),
  ],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService, TypeOrmModule],
})
export class CvModule { }
