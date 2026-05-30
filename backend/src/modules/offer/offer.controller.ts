import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto, ConfirmOfferDto } from './dto/offer.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('offers')
@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OfferController {
    constructor(private readonly offerService: OfferService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new job offer' })
    create(@Body() dto: CreateOfferDto, @CurrentUser() user: any) {
        return this.offerService.create(dto, user);
    }

    @Get('application/:applicationId')
    @ApiOperation({ summary: 'Get offer by application ID' })
    getByApplication(@Param('applicationId') applicationId: string) {
        return this.offerService.findByApplication(applicationId);
    }

    @Patch(':id/confirm')
    @ApiOperation({ summary: 'Candidate confirm/reject offer' })
    confirm(@Param('id') id: string, @Body() dto: ConfirmOfferDto, @CurrentUser() user: any) {
        return this.offerService.confirm(id, dto.confirmation, user, dto.feedback);
    }
}
