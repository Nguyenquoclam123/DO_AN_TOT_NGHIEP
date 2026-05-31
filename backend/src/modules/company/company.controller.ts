import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get company detail' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() currentUser: any,
    ) {
        const company = await this.companyService.findOne(id);
        
        // If company is not approved, only company members or admins can view it
        if (company.status !== 'APPROVED') {
            const isAdmin = currentUser && currentUser.role === 'ADMIN';
            const isOwner = currentUser && (company.userId === currentUser.id || currentUser.companyId === company.id);
            
            if (!isAdmin && !isOwner) {
                throw new ForbiddenException('Hồ sơ công ty này đang trong quá trình phê duyệt hoặc đã bị khóa.');
            }
        }
        return company;
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
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: any,
        @CurrentUser() currentUser: any
    ) {
        // If the user is an EMPLOYER, they cannot modify isVerified or status
        if (currentUser.role === Role.EMPLOYER) {
            delete data.isVerified;
            delete data.status;
            
            // Ensure they are only updating their own company
            if (currentUser.companyId !== id) {
                throw new ForbiddenException('Bạn không có quyền chỉnh sửa thông tin công ty khác.');
            }
        }
        
        return this.companyService.update(id, data);
    }
}
