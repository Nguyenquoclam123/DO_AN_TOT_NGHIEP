import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToPoolDto {
    @ApiProperty({ example: 'candidate-uuid' })
    @IsUUID()
    @IsNotEmpty()
    candidateId: string;

    @ApiProperty({ example: 'Potential Frontend Developers' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({ example: 'uuid-of-category' })
    @IsUUID()
    @IsOptional()
    categoryId?: string;
}
