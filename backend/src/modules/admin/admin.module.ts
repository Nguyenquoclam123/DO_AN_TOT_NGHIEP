import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

import { Job } from '../job/entities/job.entity';
import { Company } from '../company/entities/company.entity';
import { Application } from '../application/entities/application.entity';
import { User } from '../user/entities/user.entity';

import { SettingModule } from '../setting/setting.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Admin, Job, Company, Application, User])
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService, TypeOrmModule],
})
export class AdminModule { }
