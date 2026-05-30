import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingService } from './setting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingController {
    constructor(private readonly settingService: SettingService) { }

    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all system settings' })
    findAll() {
        return this.settingService.findAll();
    }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update system settings' })
    async update(@Body() settings: Record<string, string>) {
        for (const [key, value] of Object.entries(settings)) {
            await this.settingService.set(key, value);
        }
        return { success: true };
    }
}
