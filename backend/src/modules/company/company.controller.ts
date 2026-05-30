import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) { }

    @Get()
    @ApiOperation({ summary: 'List all companies' })
    findAll() {
        return this.companyService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get company detail' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.companyService.findOne(id);
    }

    @Get('user/my')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user company' })
    findMyCompany(@Request() req: any) {
        return this.companyService.findByUser(req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Register a new company' })
    create(@Body() data: any) {
        return this.companyService.create(data);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.EMPLOYER)
    @ApiOperation({ summary: 'Update company profile' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateCompanyDto) {
        return this.companyService.update(id, data);
    }
}
