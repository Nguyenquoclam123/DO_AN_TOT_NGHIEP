import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingService } from './embedding/embedding.service';
import { VectorSearchService } from './vector-search/vector-search.service';
import { PromptService } from './prompt-engineering/prompt.service';
import { ScoringService } from './scoring/scoring.service';
import { AiLogService } from './logs/ai-log.service';
import { AiControlService } from './ai-control/ai-control.service';
import { AiControlController } from './ai-control/ai-control.controller';
import { FeedbackService } from './feedback/feedback.service';
import { AiProcessingLog } from './logs/entities/ai-processing-log.entity';
import { AIModelConfig } from './ai-control/entities/ai-config.entity';
import { AIEvaluationMetric } from './entities/ai-evaluation.entity';
import { VectorStorage } from './entities/vector-storage.entity';

import { AIService } from './ai.service';
import { AiCandidateController } from './ai-candidate.controller';
import { JobModule } from '../modules/job/job.module';
import { CvModule } from '../modules/cv/cv.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AiProcessingLog,
            AIModelConfig,
            AIEvaluationMetric,
            VectorStorage,
        ]),
        forwardRef(() => JobModule),
        forwardRef(() => CvModule),
    ],
    controllers: [AiControlController, AiCandidateController],
    providers: [
        EmbeddingService,
        VectorSearchService,
        PromptService,
        ScoringService,
        AiLogService,
        AiControlService,
        FeedbackService,
        AIService,
    ],
    exports: [
        EmbeddingService,
        VectorSearchService,
        PromptService,
        ScoringService,
        AiLogService,
        AIService,
    ],
})
export class AiEngineModule { }
