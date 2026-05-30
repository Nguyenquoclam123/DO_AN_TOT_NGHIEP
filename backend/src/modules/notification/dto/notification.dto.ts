import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
    APPLICATION_STATUS = 'APPLICATION_STATUS',
    INTERVIEW_SCHEDULE = 'INTERVIEW_SCHEDULE',
    SYSTEM = 'SYSTEM'
}

export class CreateNotificationDto {
    @ApiProperty({ example: 'receiver-uuid' })
    @IsUUID()
    @IsNotEmpty()
    receiverId: string;

    @ApiProperty({ example: 'Application Received' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'We have received your application...' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ enum: NotificationType })
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @ApiProperty({ example: { id: 1 } })
    @IsOptional()
    metadata?: any;
}
