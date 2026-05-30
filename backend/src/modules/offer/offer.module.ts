import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffer } from './entities/offer.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { Application } from '../application/entities/application.entity';
import { ApplicationStatusHistory } from '../application/entities/application-status-history.entity';
import { User } from '../user/entities/user.entity';
import { ApplicationModule } from '../application/application.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([JobOffer]),
        NotificationModule,
        ApplicationModule
    ],
    providers: [OfferService],
    controllers: [OfferController],
    exports: [OfferService]
})
export class OfferModule { }
