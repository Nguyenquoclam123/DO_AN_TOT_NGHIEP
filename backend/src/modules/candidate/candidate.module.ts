import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { User } from '../user/entities/user.entity';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Candidate, User])],
    controllers: [CandidateController],
    providers: [CandidateService],
    exports: [CandidateService, TypeOrmModule],
})
export class CandidateModule { }
