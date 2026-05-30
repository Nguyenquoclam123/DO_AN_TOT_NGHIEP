import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question, QuestionOption, QuestionSet } from './entities/question.entity';
import { QuestionBankService } from './question-bank.service';
import { QuestionBankController } from './question-bank.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Question, QuestionOption, QuestionSet])],
    controllers: [QuestionBankController],
    providers: [QuestionBankService],
    exports: [QuestionBankService, TypeOrmModule],
})
export class QuestionBankModule { }
