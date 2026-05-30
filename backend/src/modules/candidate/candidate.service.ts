import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CandidateService {
    constructor(
        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findOne(id: string) {
        const candidate = await this.candidateRepository.findOne({
            where: { id },
            relations: ['applications']
        });
        if (!candidate) throw new NotFoundException('Candidate not found');
        return candidate;
    }

    async findByUserId(userId: string) {
        console.log(`[CandidateService] Finding candidate for userId: ${userId}`);
        let candidate = await this.candidateRepository.findOne({ where: { userId } });

        if (!candidate) {
            console.log(`[CandidateService] Candidate not found for userId: ${userId}, creating lazy...`);
            // Lazy create candidate profile from user data
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                console.error(`[CandidateService] User with id ${userId} not found!`);
                throw new NotFoundException('User not found');
            }

            candidate = this.candidateRepository.create({
                userId,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'New Candidate',
                email: user.email,
            });
            candidate = await this.candidateRepository.save(candidate);
            console.log(`[CandidateService] Created new candidate:`, candidate);
        }

        return candidate;
    }

    async update(id: string, data: any) {
        console.log(`[CandidateService] Updating candidate ${id} with:`, data);
        const candidate = await this.findOne(id);

        // Remove id and userId from data to prevent accidental modification
        const { id: _, userId: __, ...updateData } = data;

        Object.assign(candidate, updateData);
        const result = await this.candidateRepository.save(candidate);
        console.log(`[CandidateService] Update successful for candidate ${id}:`, result);
        return result;
    }
}
