import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('Blogs')
@ApiBearerAuth()
@Controller('blogs')
export class BlogController {
    constructor(private readonly blogService: BlogService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Create a new blog post' })
    create(@Body() data: any, @CurrentUser() user: any) {
        return this.blogService.create(user.companyId, data);
    }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get all blogs with filters' })
    findAll(@Query() query: any) {
        return this.blogService.findAll(query);
    }

    @Get('my')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER)
    @ApiOperation({ summary: 'Get blogs created by the current employer' })
    findMyBlogs(@CurrentUser() user: any) {
        return this.blogService.findAll({ companyId: user.companyId });
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get blog detail by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        return this.blogService.findOne(id, user);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Update blog post' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any, @CurrentUser() user: any) {
        return this.blogService.update(id, user.companyId, data);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER, Role.ADMIN)
    @ApiOperation({ summary: 'Delete a blog post' })
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        return this.blogService.remove(id, user.companyId);
    }
}
