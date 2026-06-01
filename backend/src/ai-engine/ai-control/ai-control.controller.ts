import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiControlService } from './ai-control.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AIModelConfig } from './entities/ai-config.entity';

@ApiTags('AI Control')
@ApiBearerAuth()
@Controller('ai-control')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiControlController {
    constructor(private readonly aiControlService: AiControlService) { }

    @Get('configs')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all AI model configurations' })
    async getConfigs(): Promise<AIModelConfig[]> {
        return await this.aiControlService.findAllConfigs();
    }

    @Patch('configs/:id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update specific AI model configuration' })
    async updateConfig(
        @Param('id') id: string,
        @Body() data: Partial<AIModelConfig>
    ): Promise<AIModelConfig> {
        return await this.aiControlService.updateConfig(id, data);
    }

    @Get('stats')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get AI performance and token stats' })
    async getStats(
        @Query('from') from?: string,
        @Query('to') to?: string
    ) {
        return await this.aiControlService.getPerformanceStats(from, to);
    }
}
