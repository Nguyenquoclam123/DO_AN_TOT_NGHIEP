import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum QuestionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    TEXT = 'TEXT',
    CODE = 'CODE'
}

export class QuestionOptionDto {
    @IsString()
    @IsNotEmpty()
    optionText: string;

    @IsNotEmpty()
    isCorrect: boolean;
}

export class CreateQuestionDto {
    @ApiProperty({ example: 'What is React?' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ enum: QuestionType })
    @IsEnum(QuestionType)
    type: QuestionType;

    @ApiProperty({ example: 1.0 })
    @IsNumber()
    @IsOptional()
    weight?: number;

    @ApiProperty({ type: [QuestionOptionDto], required: false })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => QuestionOptionDto)
    options?: QuestionOptionDto[];
}
