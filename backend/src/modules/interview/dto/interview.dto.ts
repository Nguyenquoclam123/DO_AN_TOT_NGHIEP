import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InterviewType {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    TECHNICAL = 'TECHNICAL',
    HR = 'HR'
}

export class ScheduleInterviewDto {
    @ApiProperty({ example: 'application-uuid' })
    @IsUUID()
    @IsNotEmpty()
    applicationId: string;

    @ApiProperty({ example: '2024-06-15T10:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    scheduledAt: string;

    @ApiProperty({ example: 'https://meet.google.com/abc-defg' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ example: 'Technical Interview' })
    @IsString()
    type: string;

    @ApiProperty({ example: 'Please prepare a portfolio.' })
    @IsString()
    @IsOptional()
    notes?: string;
}
