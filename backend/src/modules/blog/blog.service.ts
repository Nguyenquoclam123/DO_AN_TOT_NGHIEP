import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(Blog)
        private blogRepository: Repository<Blog>,
    ) {}

    async create(companyId: string, data: any) {
        const blog = this.blogRepository.create({
            ...data,
            companyId,
        });
        return this.blogRepository.save(blog);
    }

    async findAll(query: any = {}) {
        const { companyId, campaignId, jobId, status } = query;
        const where: any = {};
        if (companyId) where.companyId = companyId;
        if (campaignId) where.campaignId = campaignId;
        if (jobId) where.jobId = jobId;
        if (status) where.status = status;

        return this.blogRepository.find({
            where,
            relations: ['company', 'campaign', 'job'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, user?: any) {
        const blog = await this.blogRepository.findOne({
            where: { id },
            relations: ['company', 'campaign', 'job'],
        });
        if (!blog) throw new NotFoundException('Blog not found');
        
        // Only increment views if viewer is NOT the author
        const isAuthor = user && user.companyId === blog.companyId;
        if (!isAuthor) {
            blog.views += 1;
            await this.blogRepository.save(blog);
        }
        
        return blog;
    }

    async update(id: string, companyId: string, data: any) {
        const blog = await this.blogRepository.findOne({ where: { id, companyId } });
        if (!blog) throw new NotFoundException('Blog not found or unauthorized');
        
        Object.assign(blog, data);
        return this.blogRepository.save(blog);
    }

    async remove(id: string, companyId: string) {
        const blog = await this.blogRepository.findOne({ where: { id, companyId } });
        if (!blog) throw new NotFoundException('Blog not found or unauthorized');
        return this.blogRepository.remove(blog);
    }
}
