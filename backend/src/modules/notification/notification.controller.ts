import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get('my')
    @ApiOperation({ summary: 'Get current user notifications' })
    async getMyNotifications(@Request() req: any) {
        return this.notificationService.findByReceiver(req.user.id);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }

    @Patch('read-by-application/:applicationId')
    @ApiOperation({ summary: 'Mark notifications for a specific application as read' })
    async markByApplicationId(@Request() req: any, @Param('applicationId') applicationId: string) {
        return this.notificationService.markByApplicationId(req.user.id, applicationId);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@Request() req: any) {
        return this.notificationService.markAllAsRead(req.user.id);
    }
}
