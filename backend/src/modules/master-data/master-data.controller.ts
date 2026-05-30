import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Master Data')
@Controller('master-data')
export class MasterDataController {
    constructor(private readonly masterDataService: MasterDataService) { }

    @Get('levels')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get job levels' })
    getLevels(
        @Query('companyId') companyId?: string,
        @CurrentUser() user?: any
    ) {
        // If user is logged in, their companyId takes priority
        // If they are an admin (no companyId), we can use the query param
        const filterCompanyId = user?.companyId || companyId;
        return this.masterDataService.getLevels(filterCompanyId);
    }

    @Get('positions')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get job positions' })
    getPositions(
        @Query('companyId') companyId?: string,
        @CurrentUser() user?: any
    ) {
        const filterCompanyId = user?.companyId || companyId;
        return this.masterDataService.getPositions(filterCompanyId);
    }

    @Get('positions/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get a specific job position' })
    getPosition(@Param('id') id: string) {
        return this.masterDataService.getPositionById(id);
    }

    @Post('positions')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.EMPLOYER)
    @ApiOperation({ summary: 'Create a new job position' })
    createPosition(
        @Body() data: { name: string, description?: string, companyId?: string },
        @CurrentUser() user: any
    ) {
        // If employer, always force their companyId
        if (user.role === Role.EMPLOYER) {
            data.companyId = user.companyId;
        }
        return this.masterDataService.createPosition(data);
    }

    @Post('levels')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.EMPLOYER)
    @ApiOperation({ summary: 'Create a new job level' })
    createLevel(
        @Body() data: { name: string, level: number, description?: string, companyId?: string },
        @CurrentUser() user: any
    ) {
        // If employer, always force their companyId
        if (user.role === Role.EMPLOYER) {
            data.companyId = user.companyId;
        }
        return this.masterDataService.createLevel(data);
    }

    @Patch('positions/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.EMPLOYER)
    @ApiOperation({ summary: 'Update a job position' })
    updatePosition(
        @Param('id') id: string,
        @Body() data: { name?: string, description?: string }
    ) {
        return this.masterDataService.updatePosition(id, data);
    }

    @Delete('positions/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.EMPLOYER)
    @ApiOperation({ summary: 'Delete a job position' })
    deletePosition(@Param('id') id: string) {
        return this.masterDataService.deletePosition(id);
    }

    @Patch('levels/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.EMPLOYER)
    @ApiOperation({ summary: 'Update a job level' })
    updateLevel(
        @Param('id') id: string,
        @Body() data: { name?: string, level?: number, description?: string }
    ) {
        return this.masterDataService.updateLevel(id, data);
    }

    @Delete('levels/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.EMPLOYER)
    @ApiOperation({ summary: 'Delete a job level' })
    deleteLevel(@Param('id') id: string) {
        return this.masterDataService.deleteLevel(id);
    }
}
