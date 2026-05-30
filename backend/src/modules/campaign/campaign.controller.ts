import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, BadRequestException, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Campaigns')
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignController {
    constructor(private readonly campaignService: CampaignService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN, Role.CANDIDATE)
    @ApiOperation({ summary: 'List all campaigns' })
    findAll(@CurrentUser() user: any) {
        // Candidate: Show all active campaigns
        if (user.role === Role.CANDIDATE) {
            return this.campaignService.findAllActive();
        }

        // Employer: Show their company's campaigns
        if (user.role === Role.EMPLOYER) {
            if (!user.companyId) return [];
            return this.campaignService.findAllByCompany(user.companyId);
        }

        // Admin: Show all
        return this.campaignService.findAll();
    }

    @Get('company/:companyId')
    @ApiOperation({ summary: 'List all campaigns by company ID' })
    findAllByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
        return this.campaignService.findAllByCompany(companyId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN, Role.CANDIDATE)
    @ApiOperation({ summary: 'Get campaign detail' })
    async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        const campaign = await this.campaignService.findOne(id);

        // Security check for Employers: only see their own
        if (user.role === Role.EMPLOYER && campaign.companyId !== user.companyId) {
            throw new BadRequestException('Bạn không có quyền truy cập chiến dịch này.');
        }

        return campaign;
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Create a new campaign' })
    create(@Body() data: any, @CurrentUser() user: any) {
        return this.campaignService.create(data, user);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Update campaign' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any, @CurrentUser() user: any) {
        const campaign = await this.campaignService.findOne(id);
        if (user.role === Role.EMPLOYER && campaign.companyId !== user.companyId) {
            throw new BadRequestException('Bạn không có quyền cập nhật chiến dịch này.');
        }
        return this.campaignService.update(id, data);
    }
}
