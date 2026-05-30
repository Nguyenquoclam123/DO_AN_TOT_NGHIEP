import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobLevel } from './entities/level.entity';
import { JobPosition } from './entities/position.entity';
import { MasterDataService } from './master-data.service';
import { MasterDataController } from './master-data.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([JobLevel, JobPosition]),
        AuthModule
    ],
    controllers: [MasterDataController],
    providers: [MasterDataService],
    exports: [MasterDataService, TypeOrmModule],
})
export class MasterDataModule { }
