import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineStep } from './entities/pipeline-step.entity';
import { PipelineService } from './pipeline.service';
import { PipelineController } from './pipeline.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PipelineStep])],
    controllers: [PipelineController],
    providers: [PipelineService],
    exports: [PipelineService, TypeOrmModule],
})
export class PipelineModule { }
