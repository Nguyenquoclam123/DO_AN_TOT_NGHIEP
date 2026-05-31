import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionBankService } from '../question-bank/question-bank.service';
import { Company } from './entities/company.entity';
import { MailerService } from '../notification/mailer.service';
import { User } from '../user/entities/user.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Job } from '../job/entities/job.entity';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        private readonly questionBankService: QuestionBankService,
        private readonly mailerService: MailerService,
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

        const oldStatus = company.status;

        // Automatically map status and isVerified based on each other if only one is updated
        if (data.isVerified === true && !data.status) {
            data.status = 'APPROVED';
        } else if (data.isVerified === false && (!data.status || data.status === 'APPROVED')) {
            data.status = 'PENDING';
        } else if (data.status === 'APPROVED' && data.isVerified === undefined) {
            data.isVerified = true;
        } else if ((data.status === 'REJECTED' || data.status === 'SUSPENDED') && data.isVerified === undefined) {
            data.isVerified = false;
        }

        const newStatus = data.status || oldStatus;

        Object.assign(company, data);
        const saved = await this.companyRepository.save(company);

        // Gửi email thông báo khi trạng thái duyệt thay đổi
        if (oldStatus !== newStatus) {
            let ownerEmail = saved.email;
            
            // Tìm tài khoản User đã đăng ký doanh nghiệp để lấy email chính xác
            if (saved.userId) {
                try {
                    const owner = await this.companyRepository.manager.findOne(User, { where: { id: saved.userId } });
                    if (owner && owner.email) {
                        ownerEmail = owner.email;
                    }
                } catch (err) {
                    console.error('Failed to find owner user for email notification:', err);
                }
            }

            if (newStatus === 'APPROVED') {
                this.mailerService.sendCompanyApprovedEmail(saved.name, ownerEmail, saved.representative || 'Quý đối tác')
                    .catch(err => console.error('Failed to send company approval email:', err));
                
                // Tự động phát hành đợt tuyển dụng (Campaigns) và tin tuyển dụng (Jobs)
                const now = new Date();
                try {
                    // 1. Phê duyệt các đợt tuyển dụng (Campaigns)
                    const campaigns = await this.companyRepository.manager.find(Campaign, {
                        where: { companyId: saved.id },
                        relations: ['jobs']
                    });
                    
                    const completedCampaignJobIds = new Set<string>();
                    const activeOrUpcomingCampaignJobIds = new Set<string>();

                    for (const campaign of campaigns) {
                        if (campaign.endDate && new Date(campaign.endDate) < now) {
                            // Nếu thời hạn đợt tuyển dụng ở quá khứ -> Kết thúc luôn
                            campaign.status = 'COMPLETED';
                            if (campaign.jobs) {
                                campaign.jobs.forEach(j => completedCampaignJobIds.add(j.id));
                            }
                        } else if (campaign.startDate && new Date(campaign.startDate) > now) {
                            // Nếu bắt đầu ở tương lai -> Để trạng thái sắp diễn ra
                            campaign.status = 'UPCOMING';
                            if (campaign.jobs) {
                                campaign.jobs.forEach(j => activeOrUpcomingCampaignJobIds.add(j.id));
                            }
                        } else {
                            // Trạng thái hoạt động bình thường
                            campaign.status = 'ACTIVE';
                            if (campaign.jobs) {
                                campaign.jobs.forEach(j => activeOrUpcomingCampaignJobIds.add(j.id));
                            }
                        }
                        await this.companyRepository.manager.save(Campaign, campaign);
                    }

                    // 2. Phê duyệt các tin tuyển dụng (Jobs) ở dạng DRAFT
                    const jobs = await this.companyRepository.manager.find(Job, {
                        where: { companyId: saved.id }
                    });

                    for (const job of jobs) {
                        if (job.status === 'DRAFT') {
                            if (job.expiredAt && new Date(job.expiredAt) < now) {
                                // Nếu hết hạn -> Đóng tin
                                job.status = 'CLOSED';
                            } else if (completedCampaignJobIds.has(job.id) && !activeOrUpcomingCampaignJobIds.has(job.id)) {
                                // Nếu job thuộc đợt tuyển dụng đã hết hạn và không thuộc đợt nào đang/sắp hoạt động
                                job.status = 'CLOSED';
                            } else {
                                // Mở hoạt động tin tuyển dụng
                                job.status = 'ACTIVE';
                            }
                            await this.companyRepository.manager.save(Job, job);
                        }
                    }
                } catch (err) {
                    console.error('Failed to auto-release campaigns/jobs on company approval:', err);
                }
            } else if (newStatus === 'REJECTED') {
                this.mailerService.sendCompanyRejectedEmail(saved.name, ownerEmail, saved.representative || 'Quý đối tác', 'Vui lòng kiểm tra lại tính chính xác của mã số thuế hoặc giấy đăng ký kinh doanh doanh nghiệp.')
                    .catch(err => console.error('Failed to send company rejection email:', err));
            }
        }

        return this.attachCompleteness(saved);
    }
}
