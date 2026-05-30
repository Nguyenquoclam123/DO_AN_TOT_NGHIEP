import { Controller, Post, Body, UseGuards, Req, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AIService } from './ai.service';
import { JobService } from '../modules/job/job.service';
import { CvService } from '../modules/cv/cv.service';

@Controller('ai-candidate')
export class AiCandidateController {
    constructor(
        private readonly aiService: AIService,
        @Inject(forwardRef(() => JobService))
        private readonly jobService: JobService,
        @Inject(forwardRef(() => CvService))
        private readonly cvService: CvService,
    ) { }

    @Post('analyze-cv')
    @UseGuards(JwtAuthGuard)
    async analyzeCV(@Body() body: { jobId: string; cvId: string }, @Req() req: any) {
        const { jobId, cvId } = body;

        // 1. Get Job details
        const job = await this.jobService.findOne(jobId);
        const jobContent = `
            Title: ${job.title}
            Description: ${job.description}
            Responsibilities: ${job.responsibilities}
            Benefits: ${job.benefits}
            Requirements: ${job.requirements?.map(r => r.requiredPosition + ' ' + r.industryContext).join(', ')}
            Skills: ${job.skills?.map(s => s.skillName).join(', ')}
        `;

        // 2. Get CV details
        const cv = await this.cvService.findOne(cvId);
        const cvContent = `
            Title: ${cv.cvTitle}
            Summary: ${cv.summary}
            Skills: ${cv.skills?.map(s => s.name).join(', ')}
            Experiences: ${cv.experiences?.map(e => `${e.position} at ${e.companyName}: ${e.description}`).join('\n')}
            Projects: ${cv.projects?.map(p => `${p.name}: ${p.techStack}`).join('\n')}
        `;

        // 3. Call AI Service
        return this.aiService.analyzeCVAgainstJob(cvContent, jobContent);
    }
}
