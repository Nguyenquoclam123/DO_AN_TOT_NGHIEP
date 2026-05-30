import { IsString, IsNotEmpty, IsUUID, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfferDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    applicationId: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    salary?: number;

    @ApiProperty()
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;
}

export class ConfirmOfferDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    confirmation: 'ACCEPTED' | 'REJECTED' | 'NEGOTIATED';

    @ApiProperty()
    @IsString()
    @IsOptional()
    feedback?: string;
}
