import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyJobDto {
    @ApiProperty({ example: 'job-uuid' })
    @IsUUID()
    @IsNotEmpty()
    jobId: string;

    @ApiProperty({ example: 'cv-uuid' })
    @IsUUID()
    @IsNotEmpty()
    cvId: string;
}
