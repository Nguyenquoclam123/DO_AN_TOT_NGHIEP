import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadCvDto {
    @ApiProperty({ example: 'My Senior Resume' })
    @IsString()
    @IsNotEmpty()
    cvTitle: string;

    @ApiProperty({ example: 'raw text content from PDF' })
    @IsString()
    @IsNotEmpty()
    fileText: string;

    @ApiProperty({ example: 'candidate-uuid' })
    @IsUUID()
    @IsOptional()
    candidateId?: string;
}

export class CvDetailDto {
    id: string;
    cvTitle: string;
    summary: string;
    experiences: any[];
    educations: any[];
    skills: any[];
}
