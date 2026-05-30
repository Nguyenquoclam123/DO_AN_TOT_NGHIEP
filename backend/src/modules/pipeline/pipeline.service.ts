import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipelineStep } from './entities/pipeline-step.entity';

@Injectable()
export class PipelineService {
    constructor(
        @InjectRepository(PipelineStep)
        private readonly pipelineRepository: Repository<PipelineStep>,
    ) { }

    async findAll() {
        return await this.pipelineRepository.find({ order: { orderNumber: 'ASC' } });
    }

    async findByCompany(companyId: string) {
        return await this.pipelineRepository.find({
            where: [{ companyId }, { isDefault: true }],
            order: { orderNumber: 'ASC' }
        });
    }
}
