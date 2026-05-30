import { IsString, IsNotEmpty, IsOptional, IsUrl, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
    @ApiProperty({ example: 'Nexus Technology' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '123456789' })
    @IsString()
    @IsOptional()
    taxCode?: string;

    @ApiProperty({ example: 'https://nexus.ai' })
    @IsUrl()
    @IsOptional()
    website?: string;

    @ApiProperty({ example: 'Ho Chi Minh City' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: 'Leading AI company...' })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateCompanyDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsOptional()
    coverUrl?: string;

    @IsString()
    @IsOptional()
    scale?: string;

    @IsOptional()
    mapLocation?: any;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    establishedDate?: string;

    @IsString()
    @IsOptional()
    representative?: string;

    @IsOptional()
    employeeCount?: number;

    @IsOptional()
    offices?: any[];

    @IsOptional()
    awards?: any[];

    @IsOptional()
    services?: any[];

    @IsOptional()
    members?: any[];

    @IsOptional()
    partners?: any[];

    @IsString()
    @IsOptional()
    taxCode?: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
