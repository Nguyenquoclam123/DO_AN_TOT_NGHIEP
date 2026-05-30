import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobFavoriteService } from './job-favorite.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobController {
    constructor(
        private readonly jobService: JobService,
        private readonly jobFavoriteService: JobFavoriteService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Create a new job post (Employer/Admin only)' })
    @ApiResponse({ status: 201, description: 'The job has been successfully created.' })
    create(
        @Body() createJobDto: CreateJobDto,
        @CurrentUser() user: any
    ) {
        return this.jobService.create(createJobDto, user);
    }

    @Get('job-favorites-list')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get favorite jobs for current candidate' })
    getFavorites(@CurrentUser() user: any) {
        return this.jobFavoriteService.getFavorites(user.id);
    }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get all jobs with filters (Public)' })
    findAll(
        @Query() query: any,
        @CurrentUser() user: any
    ) {
        return this.jobService.findAll(query, user);
    }

    @Get('my')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER)
    @ApiOperation({ summary: 'Get jobs created by the current employer company' })
    findMyJobs(@CurrentUser() user: any) {
        if (!user.companyId) return [];
        return this.jobService.findAll({ companyId: user.companyId }, user);
    }

    @Get('history')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER)
    @ApiOperation({ summary: 'Get history of used job content for quick selection' })
    getHistory(@CurrentUser() user: any) {
        if (!user.companyId) return { titles: [], descriptions: [], responsibilities: [], benefits: [], locations: [] };
        return this.jobService.getHistory(user.companyId);
    }

    @Post(':id/favorite')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Toggle favorite status for a job' })
    toggleFavorite(
        @Param('id', ParseUUIDPipe) id: string, 
        @Query('categoryId') categoryId: string,
        @CurrentUser() user: any
    ) {
        console.log(`[JobController] User ${user.id} favoriting job ${id} into category: ${categoryId || 'DEFAULT'}`);
        return this.jobFavoriteService.toggleFavorite(user.id, id, categoryId);
    }

    @Get('favorite-categories')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get favorite categories for current candidate' })
    getCategories(@CurrentUser() user: any) {
        return this.jobFavoriteService.getCategories(user.id);
    }

    @Post('favorite-categories')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new favorite category' })
    createCategory(@Body('name') name: string, @CurrentUser() user: any) {
        return this.jobFavoriteService.createCategory(user.id, name);
    }

    @Get(':id/is-favorite')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Check if job is favorited' })
    async checkFavorite(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        const isFavorite = await this.jobFavoriteService.isFavorite(user.id, id);
        return { isFavorite };
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard, RolesGuard)
    @Roles(Role.CANDIDATE, Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Get job detail by ID (Public)' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.jobService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Update job post (Employer/Admin only)' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateJobDto: UpdateJobDto) {
        return this.jobService.update(id, updateJobDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Delete a job post (Employer/Admin only)' })
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        return this.jobService.remove(id, user.companyId);
    }
}
