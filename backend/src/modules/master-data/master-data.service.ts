import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JobLevel } from './entities/level.entity';
import { JobPosition } from './entities/position.entity';

@Injectable()
export class MasterDataService {
    constructor(
        @InjectRepository(JobLevel)
        private readonly levelRepository: Repository<JobLevel>,
        @InjectRepository(JobPosition)
        private readonly positionRepository: Repository<JobPosition>,
    ) { }

    async getLevels(companyId?: string) {
        // Build OR conditions: global items (companyId is null) OR items belonging to the current company
        const conditions: any[] = [{ companyId: IsNull(), isActive: true }];
        
        if (companyId) {
            conditions.push({ companyId, isActive: true });
        }

        return await this.levelRepository.find({
            where: conditions,
            order: { level: 'ASC' }
        });
    }

    async getPositions(companyId?: string) {
        // Build OR conditions: global items (companyId is null) OR items belonging to the current company
        const conditions: any[] = [{ companyId: IsNull(), isActive: true }];
        
        if (companyId) {
            conditions.push({ companyId, isActive: true });
        }

        return await this.positionRepository.find({
            where: conditions,
            order: { name: 'ASC' }
        });
    }

    async getPositionById(id: string) {
        return await this.positionRepository.findOne({ where: { id } });
    }

    async createPosition(data: { name: string, description?: string, companyId?: string }) {
        const position = this.positionRepository.create(data);
        return await this.positionRepository.save(position);
    }

    async createLevel(data: { name: string, level: number, description?: string, companyId?: string }) {
        const level = this.levelRepository.create(data);
        return await this.levelRepository.save(level);
    }

    async updatePosition(id: string, data: { name?: string, description?: string, isActive?: boolean }) {
        await this.positionRepository.update(id, data);
        return await this.positionRepository.findOne({ where: { id } });
    }

    async deletePosition(id: string) {
        // Soft delete: just set isActive to false
        return await this.positionRepository.update(id, { isActive: false });
    }

    async updateLevel(id: string, data: { name?: string, level?: number, description?: string, isActive?: boolean }) {
        await this.levelRepository.update(id, data);
        return await this.levelRepository.findOne({ where: { id } });
    }

    async deleteLevel(id: string) {
        // Soft delete: just set isActive to false
        return await this.levelRepository.update(id, { isActive: false });
    }
}
