import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard-stats')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get overall system stats' })
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('ai-stats')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get AI performance and feedback stats' })
    async getAIStats() {
        return this.adminService.getAIStats();
    }
}
