import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCandidateDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiProperty({ example: '+84900000000' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'Hanoi, Vietnam' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: 'avatar-url' })
    @IsString()
    @IsOptional()
    avatar?: string;
}
