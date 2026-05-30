import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteJob } from './entities/favorite-job.entity';
import { Job } from './entities/job.entity';
import { FavoriteCategory } from './entities/favorite-category.entity';

@Injectable()
export class JobFavoriteService {
    constructor(
        @InjectRepository(FavoriteJob)
        private favoriteJobRepository: Repository<FavoriteJob>,
        @InjectRepository(Job)
        private jobRepository: Repository<Job>,
        @InjectRepository(FavoriteCategory)
        private favoriteCategoryRepository: Repository<FavoriteCategory>,
    ) {}

    async toggleFavorite(userId: string, jobId: string, categoryId?: string) {
        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const existing = await this.favoriteJobRepository.findOne({
            where: { userId, jobId },
        });

        if (existing) {
            await this.favoriteJobRepository.remove(existing);
            return { isFavorite: false };
        } else {
            const favorite = this.favoriteJobRepository.create({ 
                userId, 
                jobId, 
                categoryId: categoryId || null 
            });
            await this.favoriteJobRepository.save(favorite);
            return { isFavorite: true };
        }
    }

    async getFavorites(userId: string) {
        const favorites = await this.favoriteJobRepository.find({
            where: { userId },
            relations: ['job', 'job.company', 'job.category', 'job.skills', 'job.level', 'job.position', 'category'],
            order: { createdAt: 'DESC' },
        });
        
        return favorites.map(f => ({
            ...f.job,
            savedAt: f.createdAt,
            favoriteCategory: f.category ? { id: f.category.id, name: f.category.name } : null
        }));
    }

    async isFavorite(userId: string, jobId: string) {
        const favorite = await this.favoriteJobRepository.findOne({
            where: { userId, jobId },
        });
        return !!favorite;
    }

    // Category methods
    async getCategories(userId: string) {
        return this.favoriteCategoryRepository.find({
            where: { userId },
            order: { name: 'ASC' }
        });
    }

    async createCategory(userId: string, name: string) {
        const category = this.favoriteCategoryRepository.create({ userId, name });
        return this.favoriteCategoryRepository.save(category);
    }

    async deleteCategory(userId: string, categoryId: string) {
        const category = await this.favoriteCategoryRepository.findOne({
            where: { id: categoryId, userId }
        });
        if (!category) throw new NotFoundException('Category not found');
        return this.favoriteCategoryRepository.remove(category);
    }
}
