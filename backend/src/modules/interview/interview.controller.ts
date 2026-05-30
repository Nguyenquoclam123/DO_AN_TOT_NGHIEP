import { Controller, Post, Body, Get, Param, Patch, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewService } from './interview.service';
import { ScheduleInterviewDto } from './dto/interview.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Interviews')
@ApiBearerAuth()
@Controller('interviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InterviewController {
    constructor(private readonly interviewService: InterviewService) { }

    @Post()
    @ApiOperation({ summary: 'Schedule a new interview' })
    schedule(@Body() dto: ScheduleInterviewDto, @CurrentUser() user: any) {
        return this.interviewService.schedule(dto, user);
    }

    @Get('application/:id')
    @ApiOperation({ summary: 'Get interviews for an application' })
    findByApp(@Param('id', ParseUUIDPipe) id: string) {
        return this.interviewService.findByApplication(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update interview details' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: Partial<ScheduleInterviewDto>,
        @CurrentUser() user: any
    ) {
        return this.interviewService.update(id, dto, user);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update interview status' })
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: string
    ) {
        return this.interviewService.updateStatus(id, status);
    }

    @Patch(':id/confirm')
    @ApiOperation({ summary: 'Candidate confirm/reject interview' })
    confirm(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('confirmation') confirmation: 'ACCEPTED' | 'REJECTED' | 'RESCHEDULE_REQUESTED',
        @CurrentUser() user: any,
        @Body('feedback') feedback?: string
    ) {
        return this.interviewService.confirmInterview(id, confirmation, user, feedback);
    }
}
