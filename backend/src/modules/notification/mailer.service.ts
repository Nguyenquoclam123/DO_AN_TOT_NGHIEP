import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);
    private transporter: nodemailer.Transporter | null = null;

    constructor(private readonly configService: ConfigService) {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = this.configService.get<number>('SMTP_PORT') || 587;
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');

        if (!host || !user || !pass) {
            this.logger.warn('SMTP settings are missing. MailerService will run in mock/log mode.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });
    }

    async sendMail(to: string, subject: string, html: string): Promise<boolean> {
        const from = this.configService.get<string>('SMTP_FROM') || 'no-reply@ats-platform.com';
        
        if (!this.transporter) {
            this.logger.log(`[MOCK EMAIL] TO: ${to} | SUBJECT: ${subject} | HTML: ${html.substring(0, 150)}...`);
            return true;
        }

        try {
            await this.transporter.sendMail({
                from,
                to,
                subject,
                html,
            });
            this.logger.log(`Email successfully sent to ${to}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
            return false;
        }
    }

    async sendCompanyRegisteredEmail(companyName: string, email: string, representativeName: string) {
        const subject = `[ATS Platform] Đăng ký doanh nghiệp thành công - Đang chờ kiểm duyệt`;
        const html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; padding: 12px; background-color: #eff6ff; border-radius: 12px;">
                        <span style="font-size: 24px; color: #3b82f6;">🏢</span>
                    </div>
                    <h2 style="color: #1e3a8a; margin-top: 16px; font-weight: 800;">Đăng ký Doanh nghiệp Thành công!</h2>
                </div>
                
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Xin chào <strong>${representativeName}</strong>,</p>
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản doanh nghiệp cho <strong>${companyName}</strong> trên hệ thống của chúng tôi.</p>
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Hồ sơ của bạn hiện đang được chuyển tới Ban quản trị để tiến hành kiểm duyệt thông tin (tên doanh nghiệp, mã số thuế, đại diện pháp luật).</p>
                
                <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 20px; margin: 24px 0; border-radius: 8px;">
                    <p style="margin: 0; font-weight: 800; color: #b45309; font-size: 14px;">Lưu ý về tài khoản:</p>
                    <p style="margin: 6px 0 0; color: #78350f; font-size: 13.5px; line-height: 1.6;">Trong thời gian chờ duyệt, bạn vẫn có thể cập nhật hồ sơ doanh nghiệp. Tuy nhiên, các tính năng đăng tin tuyển dụng chính thức, tìm ứng viên bằng AI và nhắn tin sẽ tạm thời bị khóa.</p>
                </div>
                
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Chúng tôi sẽ gửi email thông báo ngay khi Ban quản trị hoàn tất việc phê duyệt hồ sơ (thường trong vòng 24 giờ làm việc).</p>
                
                <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                    Đây là email tự động từ hệ thống ATS Platform.<br/>Vui lòng không phản hồi lại email này.
                </p>
            </div>
        `;
        return this.sendMail(email, subject, html);
    }

    async sendCompanyApprovedEmail(companyName: string, email: string, representativeName: string) {
        const subject = `[ATS Platform] Hồ sơ doanh nghiệp đã được PHÊ DUYỆT thành công`;
        const html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; padding: 12px; background-color: #ecfdf5; border-radius: 12px;">
                        <span style="font-size: 24px; color: #10b981;">✅</span>
                    </div>
                    <h2 style="color: #065f46; margin-top: 16px; font-weight: 800;">Tài khoản đã được kích hoạt!</h2>
                </div>
                
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Xin chào <strong>${representativeName}</strong>,</p>
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Chúng tôi xin vui mừng thông báo hồ sơ doanh nghiệp của <strong>${companyName}</strong> đã được Ban quản trị phê duyệt thành công.</p>
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Tài khoản của bạn đã được xác minh (Verified) và mở khóa toàn bộ tính năng tuyển dụng trên hệ thống:</p>
                
                <ul style="color: #475569; font-size: 14.5px; line-height: 1.8; padding-left: 20px;">
                    <li>Đăng tin tuyển dụng chính thức lên sàn tuyển dụng.</li>
                    <li>Sử dụng AI kết hợp tìm ứng viên tài năng trong Talent Pool.</li>
                    <li>Sử dụng ngân hàng câu hỏi thông minh và các tính năng tương tác tự động.</li>
                </ul>
                
                <div style="text-align: center; margin: 36px 0;">
                    <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/employer/dashboard" style="background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(16,185,129,0.2);">Truy cập Dashboard Tuyển dụng</a>
                </div>
                
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Chúc doanh nghiệp của bạn sớm tìm kiếm được những ứng viên phù hợp nhất!</p>
                
                <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                    ATS Platform Team • Hỗ trợ doanh nghiệp tìm kiếm tài năng công nghệ.
                </p>
            </div>
        `;
        return this.sendMail(email, subject, html);
    }

    async sendCompanyRejectedEmail(companyName: string, email: string, representativeName: string, reason?: string) {
        const subject = `[ATS Platform] Kết quả phê duyệt hồ sơ doanh nghiệp`;
        const html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; padding: 12px; background-color: #fef2f2; border-radius: 12px;">
                        <span style="font-size: 24px; color: #ef4444;">❌</span>
                    </div>
                    <h2 style="color: #991b1b; margin-top: 16px; font-weight: 800;">Hồ sơ chưa được phê duyệt</h2>
                </div>
                
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Xin chào <strong>${representativeName}</strong>,</p>
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Ban quản trị hệ thống đã xem xét hồ sơ đăng ký doanh nghiệp của <strong>${companyName}</strong>.</p>
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Rất tiếc, hồ sơ của bạn chưa đáp ứng đủ điều kiện phê duyệt của chúng tôi tại thời điểm này.</p>
                
                ${reason ? `
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 8px;">
                    <p style="margin: 0; font-weight: 800; color: #991b1b; font-size: 14px;">Lý do:</p>
                    <p style="margin: 4px 0 0; color: #7f1d1d; font-size: 13.5px; line-height: 1.6;">${reason}</p>
                </div>
                ` : ''}
                
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Vui lòng đăng nhập lại vào hệ thống tuyển dụng để cập nhật lại thông tin chính xác (Tên doanh nghiệp, Mã số thuế, Người đại diện) và gửi lại yêu cầu phê duyệt.</p>
                
                <div style="text-align: center; margin: 36px 0;">
                    <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/employer/settings" style="background-color: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(239,68,68,0.2);">Cập nhật hồ sơ doanh nghiệp</a>
                </div>
                
                <p style="font-size: 15px; color: #334155; line-height: 1.6;">Trân trọng cảm ơn,</p>
                
                <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                    ATS Platform Team.
                </p>
            </div>
        `;
        return this.sendMail(email, subject, html);
    }
}
