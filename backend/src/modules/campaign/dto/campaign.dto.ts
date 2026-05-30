import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
    @ApiProperty({ example: 'Summer Internship 2024' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'company-uuid' })
    @IsUUID()
    @IsNotEmpty()
    companyId: string;

    @ApiProperty({ example: 'Special program for students...' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '2024-06-01' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ example: '2024-08-31' })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}
