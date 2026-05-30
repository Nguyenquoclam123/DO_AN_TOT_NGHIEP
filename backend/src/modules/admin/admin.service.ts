import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { Job } from '../job/entities/job.entity';
import { Company } from '../company/entities/company.entity';
import { Application } from '../application/entities/application.entity';
import { User } from '../user/entities/user.entity';
import { SettingService } from '../setting/setting.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>,
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly settingService: SettingService,
    ) { }

    async getStats() {
        const [totalJobs, totalCompanies, totalApplications, totalCandidates] = await Promise.all([
            this.jobRepository.count(),
            this.companyRepository.count(),
            this.applicationRepository.count(),
            this.userRepository.count({ where: { role: 'CANDIDATE' } })
        ]);

        return {
            totalJobs,
            totalCompanies,
            totalApplications,
            totalCandidates,
            aiSuccessRate: '95%'
        };
    }

    async getAIStats() {
        const [totalRequests, feedbackApps, activeModel] = await Promise.all([
            this.applicationRepository.count(),
            this.applicationRepository.find({
                where: { aiFeedback: 'INACCURATE' },
                relations: ['candidate', 'job', 'job.company'],
                take: 5,
                order: { createdAt: 'DESC' }
            }),
            this.settingService.get('ai_model')
        ]);

        const accuracy = totalRequests > 0 ? ((totalRequests - feedbackApps.length) / totalRequests * 100).toFixed(1) : '100';

        return {
            totalRequests,
            avgAccuracy: accuracy,
            avgLatencyMs: 850,
            tokenUsage: "4.2M / 10M",
            topModel: activeModel || 'gemini-1.5-pro',
            anomalies: feedbackApps.map(app => ({
                id: app.id,
                candidate: `${app.candidate?.firstName || 'Unknown'} ${app.candidate?.lastName || ''}`,
                employer: app.job?.company?.name || 'Nexus Core',
                issue: app.aiComment || 'AI scoring mismatch',
                date: 'Recently',
                status: 'PENDING'
            }))
        };
    }
}
