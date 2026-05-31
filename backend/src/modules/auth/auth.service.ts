import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CompanyService } from '../company/company.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { QuestionBankService } from '../question-bank/question-bank.service';
import { MailerService } from '../notification/mailer.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly companyService: CompanyService,
        private readonly questionBankService: QuestionBankService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
    ) { }

    async login(loginDto: LoginDto) {
        const startTime = Date.now();
        console.log(`[AuthService] Starting login for ${loginDto.email}`);

        // Use lowercase for email comparison
        const user = await this.userService.findByEmail(loginDto.email.toLowerCase());
        
        if (!user) {
            throw new UnauthorizedException('Tài khoản không tồn tại trong hệ thống');
        }

        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Tài khoản của bạn đang bị khóa hoặc chưa được kích hoạt');
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Mật khẩu không chính xác');
        }

        // Role verification if provided from frontend selection
        if (loginDto.role && user.role !== loginDto.role) {
            const roleLabels = {
                'CANDIDATE': 'Ứng viên',
                'EMPLOYER': 'Nhà tuyển dụng',
                'ADMIN': 'Quản trị viên'
            };
            throw new UnauthorizedException(`Tài khoản này được đăng ký với vai trò ${roleLabels[user.role] || user.role}. Vui lòng chọn đúng vai trò để đăng nhập.`);
        }

        const payload = { sub: user.id, email: user.email, role: user.role, companyId: user.companyId };
        const result = {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                company: user.company ? {
                    id: user.company.id,
                    name: user.company.name
                } : null,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };

        console.log(`[AuthService] Login completed in ${Date.now() - startTime}ms`);
        return result;
    }

    async register(registerDto: any) {
        // Check if email already exists
        const existingUser = await this.userService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email đã tồn tại trong hệ thống');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        let companyId = registerDto.companyId;
        let newCompany = null;

        // Create company for EMPLOYER if companyName is provided
        if (registerDto.role === 'EMPLOYER' && registerDto.companyName) {
            // Check if taxCode already exists to prevent duplicates
            if (registerDto.taxCode) {
                const existingTaxCode = await this.companyService.findByTaxCode(registerDto.taxCode);
                if (existingTaxCode) {
                    throw new ConflictException(`Mã số thuế ${registerDto.taxCode} đã được đăng ký bởi công ty khác`);
                }
            }

            newCompany = await this.companyService.create({
                name: registerDto.companyName,
                taxCode: registerDto.taxCode,
                address: registerDto.address,
                email: registerDto.email,
                representative: `${registerDto.firstName} ${registerDto.lastName}`.trim()
            });
            companyId = newCompany.id;

            // Gửi email thông báo đăng ký doanh nghiệp thành công
            const representativeName = `${registerDto.firstName} ${registerDto.lastName}`.trim();
            this.mailerService.sendCompanyRegisteredEmail(
                registerDto.companyName,
                registerDto.email,
                representativeName
            ).catch(err => console.error('Failed to send company registration email:', err));
        }

        const user = await this.userService.create({
            email: registerDto.email,
            passwordHash,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            role: registerDto.role || 'CANDIDATE',
            companyId: companyId
        });

        // Link the company to the user ID if it was just created
        if (newCompany && user) {
            await this.companyService.update(newCompany.id, { userId: user.id });
        }

        // Auto login after register
        return this.login({ email: user.email, password: registerDto.password });
    }
}
