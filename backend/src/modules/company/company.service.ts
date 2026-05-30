import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionBankService } from '../question-bank/question-bank.service';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        private readonly questionBankService: QuestionBankService,
    ) { }

    async findAll() {
        return await this.companyRepository.find();
    }

    async findOne(id: string) {
        const company = await this.companyRepository.findOne({ where: { id } });
        if (!company) throw new NotFoundException('Company not found');
        return this.attachCompleteness(company);
    }

    async findByUser(userId: string) {
        const company = await this.companyRepository.findOne({ where: { userId } });
        if (!company) return null;
        return this.attachCompleteness(company);
    }

    async findByTaxCode(taxCode: string) {
        return await this.companyRepository.findOne({ where: { taxCode } });
    }

    private attachCompleteness(company: Company) {
        const fields = ['name', 'taxCode', 'website', 'logoUrl', 'coverUrl', 'email', 'address', 'description', 'establishedDate', 'representative', 'employeeCount', 'scale'];
        let filledCount = 0;
        
        fields.forEach(f => {
            if (company[f as keyof Company]) filledCount++;
        });

        // Arrays
        if (company.offices && company.offices.length > 0) filledCount++;
        if (company.services && company.services.length > 0) filledCount++;
        if (company.awards && company.awards.length > 0) filledCount++;
        if (company.members && company.members.length > 0) filledCount++;
        if (company.partners && company.partners.length > 0) filledCount++;

        const totalItems = fields.length + 5;
        const percentage = Math.round((filledCount / totalItems) * 100);
        
        return { ...company, completeness: percentage };
    }

    async create(data: Partial<Company>) {
        const company = this.companyRepository.create(data);
        const saved = await this.companyRepository.save(company);
        
        // Bootstrap question bank for the new company
        try {
            await this.questionBankService.bootstrapCompany(saved.id);
        } catch (error) {
            console.error(`Failed to bootstrap question bank for company ${saved.id}:`, error);
        }

        return this.attachCompleteness(saved);
    }

    async update(id: string, data: Partial<Company>) {
        const company = await this.companyRepository.findOne({ where: { id } });
        if (!company) throw new NotFoundException('Company not found');
        Object.assign(company, data);
        const saved = await this.companyRepository.save(company);
        return this.attachCompleteness(saved);
    }
}
