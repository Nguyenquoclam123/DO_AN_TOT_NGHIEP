import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty({ example: 'room-uuid' })
    @IsUUID()
    @IsNotEmpty()
    roomId: string;

    @ApiProperty({ example: 'Hello, I have a question about...' })
    @IsString()
    @IsNotEmpty()
    messageText: string;

    @ApiProperty({ example: 'https://cdn.example.com/file.pdf', required: false })
    @IsString()
    @IsOptional()
    attachmentUrl?: string;
}

export class CreateChatRoomDto {
    @ApiProperty({ example: 'application-uuid', required: false })
    @IsOptional()
    @IsString()
    applicationId?: string;

    @ApiProperty({ example: 'job-uuid', required: false })
    @IsOptional()
    @IsString()
    jobId?: string;

    @ApiProperty({ example: 'candidate-uuid' })
    @IsUUID()
    @IsNotEmpty()
    candidateId: string;

    @ApiProperty({ example: 'company-uuid' })
    @IsUUID()
    @IsNotEmpty()
    companyId: string;
}
