import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';

@ApiTags('Pipeline')
@Controller('pipeline')
export class PipelineController {
    constructor(private readonly pipelineService: PipelineService) { }

    @Get()
    @ApiOperation({ summary: 'Get default pipeline steps' })
    findAll() {
        return this.pipelineService.findAll();
    }

    @Get('company/:companyId')
    @ApiOperation({ summary: 'Get pipeline steps for a company' })
    findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
        return this.pipelineService.findByCompany(companyId);
    }
}
