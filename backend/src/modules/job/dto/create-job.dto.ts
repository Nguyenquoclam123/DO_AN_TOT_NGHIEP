import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
    @ApiProperty({ example: 'Senior React Developer' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'We are looking for...' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'Implement new features...' })
    @IsString()
    @IsOptional()
    responsibilities?: string;

    @ApiProperty({ example: 'Free lunch, Healthcare...' })
    @IsString()
    @IsOptional()
    benefits?: string;

    @ApiProperty({ example: ['uuid-of-campaign-1', 'uuid-of-campaign-2'] })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    campaign_ids?: string[];

    @ApiProperty({ example: 'uuid-of-category' })
    @IsString()
    @IsOptional()
    category_id?: string;

    @ApiProperty({ example: 'uuid-of-position' })
    @IsUUID()
    @IsOptional()
    positionId?: string;

    @ApiProperty({ example: 'uuid-of-level' })
    @IsUUID()
    @IsOptional()
    levelId?: string;

    @ApiProperty({ example: 5 })
    @IsNumber()
    @IsOptional()
    quantity?: number;

    @ApiProperty({ example: 2000 })
    @IsNumber()
    @IsOptional()
    salary_min?: number;

    @ApiProperty({ example: 4000 })
    @IsNumber()
    @IsOptional()
    salary_max?: number;

    @ApiProperty({ example: 'Remote / Ho Chi Minh' })
    @IsString()
    @IsOptional()
    work_location?: string;

    @ApiProperty({ example: 'Full-time' })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({ example: 'Full-time' })
    @IsString()
    @IsOptional()
    work_time?: string;

    @ApiProperty({ example: '2024-12-31' })
    @IsDateString()
    @IsOptional()
    expired_at?: string;

    @ApiProperty({ example: ['React', 'TypeScript', 'Node.js'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skills?: string[];

    @ApiProperty({ example: ['set-uuid-1', 'set-uuid-2'] })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    question_set_ids?: string[];

    @ApiProperty({ example: 3 })
    @IsNumber()
    @IsOptional()
    minExperience?: number;

    @ApiProperty({ example: 'Ưu tiên kinh nghiệm làm việc tại các startup Fintech.' })
    @IsString()
    @IsOptional()
    experienceNote?: string;

    @ApiProperty({ example: 'Đại học' })
    @IsString()
    @IsOptional()
    minEducation?: string;

    @ApiProperty({ example: ['AWS Certified', 'IELTS 7.0'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    certificates?: string[];

    @ApiProperty({ example: 'ACTIVE' })
    @IsString()
    @IsOptional()
    status?: string;
}
