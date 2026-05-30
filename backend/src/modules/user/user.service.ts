import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        // Explicitly select passwordHash because it has { select: false } in entity
        return this.userRepository.createQueryBuilder('user')
            .addSelect('user.passwordHash')
            .leftJoinAndSelect('user.company', 'company')
            .where('user.email = :email', { email })
            .getOne();
    }

    async findProfile(id: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['company']
        });

        if (!user) throw new NotFoundException('User not found');

        // If candidate, you might want to join candidateProfile too
        // But for logo/avatar purposes, company and user details are usually enough
        return user;
    }

    async create(data: Partial<User>): Promise<User> {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }
}
