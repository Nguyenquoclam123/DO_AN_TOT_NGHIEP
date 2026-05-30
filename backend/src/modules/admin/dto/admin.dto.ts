import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
    @ApiProperty({ example: 'admin@nexus.ai' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'admin-password' })
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}

export class SystemConfigDto {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    value: string;
}
