import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { Staff } from './entities/staff.entity';
import { CompanyGallery } from './entities/gallery.entity';
import { QuestionBankModule } from '../question-bank/question-bank.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Staff, CompanyGallery]),
    QuestionBankModule
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule { }
