import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePipelineStepDto {
    @ApiProperty({ example: 'Technical Interview' })
    @IsString()
    @IsNotEmpty()
    stepName: string;

    @ApiProperty({ example: 2 })
    @IsNumber()
    orderNumber: number;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
