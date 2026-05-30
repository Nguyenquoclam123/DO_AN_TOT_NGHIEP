import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    ParseUUIDPipe,
    UseGuards,
    Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CvService } from './cv.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('CVs')
@ApiBearerAuth()
@Controller('cvs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CvController {
    constructor(private readonly cvService: CvService) { }

    @Post('upload')
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Upload and parse CV using AI (Candidate only)' })
    async upload(
        @Request() req: any,
        @Body('cv_title') cvTitle: string,
        @Body('file_text') fileText: string,
    ) {
        return this.cvService.uploadAndParse(req.user.id, cvTitle, fileText);
    }

    /**
     * ⭐ Endpoint Tối ưu hóa CV theo Job cụ thể
     */
    @Post('optimize')
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Get AI suggestions to optimize CV for a specific Job' })
    async optimize(
        @Body('cv_id') cvId: string,
        @Body('job_id') jobId: string,
    ) {
        return this.cvService.optimizeForJob(cvId, jobId);
    }

    @Get('my')
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Get all CVs for the current logged-in candidate' })
    findMyCVs(@Request() req: any) {
        return this.cvService.findByCandidate(req.user.id);
    }

    @Get('history')
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Get history of used CV content for quick selection' })
    getHistory(@Request() req: any) {
        return this.cvService.getHistory(req.user.id);
    }

    @Get('candidate/:id')
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Get all CVs for a specific candidate (Employer/Admin only)' })
    findByCandidate(@Param('id', ParseUUIDPipe) id: string) {
        return this.cvService.findByCandidate(id);
    }

    @Get(':id')
    @Roles(Role.CANDIDATE, Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Get a specific CV by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.cvService.findOne(id);
    }

    @Post()
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Save a new CV from Builder' })
    save(@Request() req: any, @Body() data: any) {
        return this.cvService.save(req.user.id, data);
    }

    @Post('delete/:id')
    @Roles(Role.CANDIDATE)
    @ApiOperation({ summary: 'Delete a CV' })
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.cvService.delete(id);
    }
}
