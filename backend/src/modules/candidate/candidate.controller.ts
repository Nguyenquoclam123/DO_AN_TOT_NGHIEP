import { Controller, Get, Param, Patch, Body, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Candidates')
@ApiBearerAuth()
@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidateController {
    constructor(private readonly candidateService: CandidateService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current candidate profile' })
    findMe(@Request() req: any) {
        return this.candidateService.findByUserId(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get candidate profile and apps' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.candidateService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update candidate profile' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
        return this.candidateService.update(id, data);
    }
}
