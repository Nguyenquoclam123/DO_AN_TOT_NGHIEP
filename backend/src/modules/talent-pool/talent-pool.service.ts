import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TalentPool } from './entities/talent-pool.entity';
import { AddToPoolDto } from './dto/talent-pool.dto';

@Injectable()
export class TalentPoolService {
    constructor(
        @InjectRepository(TalentPool)
        private readonly talentPoolRepository: Repository<TalentPool>,
    ) { }

    async addToPool(dto: AddToPoolDto) {
        const entry = this.talentPoolRepository.create(dto);
        return await this.talentPoolRepository.save(entry);
    }

    async findAll() {
        return await this.talentPoolRepository.find({
            relations: ['candidate']
        });
    }

    async removeFromPool(id: string) {
        return await this.talentPoolRepository.delete(id);
    }
}
