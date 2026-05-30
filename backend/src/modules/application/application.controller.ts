import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Patch,
    Body,
    ParseUUIDPipe,
    UseGuards,
    Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) { }

    @Get()
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Get all applications (Employer/Admin)' })
    findAll(@CurrentUser() user: any) {
        if (user.role === Role.EMPLOYER) {
            if (!user.companyId) return [];
            return this.applicationService.findAllByCompany(user.companyId);
        }
        return this.applicationService.findAll();
    }

    @Post()
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Candidate apply for a job' })
    create(@Request() req: any, @Body() createDto: { jobId: string; candidateId: string; cvId: string }) {
        const candidateId = req.user.id;
        return this.applicationService.create({ ...createDto, candidateId });
    }

    @Get('job/:jobId')
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Get all applications for a specific job' })
    findAllByJob(@Param('jobId', ParseUUIDPipe) jobId: string, @Query() query: any) {
        return this.applicationService.findAllByJob(jobId, query);
    }

    @Get('my')
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Get current candidate applications' })
    findByCandidate(@Request() req: any) {
        return this.applicationService.findByCandidate(req.user.id);
    }

    @Get('feedback-logs')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all employer AI feedback logs (Admin)' })
    getFeedbackLogs() {
        return this.applicationService.getFeedbackLogs();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get application detail' })
    findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        return this.applicationService.findOne(id, user);
    }

    @Get(':id/ai-report')
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Get AI Insight Report' })
    async getAIReport(@Param('id', ParseUUIDPipe) id: string) {
        const app = await this.applicationService.findOne(id);
        if (app.aiReport) return app.aiReport;
        return this.applicationService.generateAIReport(id);
    }

    @Patch(':id/status')
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Update status' })
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body('status') status: string,
        @CurrentUser() user: any,
        @Body('rejectionReason') rejectionReason?: string,
        @Body('note') note?: string
    ) {
        return this.applicationService.updateStatus(id, status, user, rejectionReason, note);
    }

    /**
     * ⭐ Nộp phản hồi về hiệu suất AI
     */
    @Post(':id/ai-feedback')
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Submit feedback on AI performance' })
    submitFeedback(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { aiFeedback: string; aiComment?: string }
    ) {
        return this.applicationService.submitFeedback(id, body);
    }

    @Post(':id/trigger-ai')
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Trigger AI re-analysis for a specific application' })
    triggerAI(@Param('id', ParseUUIDPipe) id: string) {
        return this.applicationService.generateAIReport(id);
    }

    @Post('trigger-ai-all')
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Trigger AI re-analysis for all applications' })
    triggerAIAll() {
        return this.applicationService.reAnalyzeAll();
    }

    @Post(':id/withdraw')
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Candidate request to withdraw application' })
    requestWithdraw(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('reason') reason: string,
        @CurrentUser() user: any
    ) {
        return this.applicationService.requestWithdraw(id, reason, user);
    }

    @Post(':id/accept-withdraw')
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Employer accept candidate withdraw request' })
    acceptWithdraw(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        return this.applicationService.acceptWithdraw(id, user);
    }
}
