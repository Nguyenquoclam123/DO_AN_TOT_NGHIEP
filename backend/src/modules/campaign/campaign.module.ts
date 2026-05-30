import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './entities/campaign.entity';
import { Job } from '../job/entities/job.entity';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Campaign, Job])],
    controllers: [CampaignController],
    providers: [CampaignService], // Testing edit
    exports: [CampaignService, TypeOrmModule],
})
export class CampaignModule { }
