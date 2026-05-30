import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingService } from '../../ai-engine/embedding/embedding.service';
import { CandidateCv } from '../cv/entities/candidate-cv.entity';

export interface ChatHistoryMessage {
    role: 'user' | 'model';
    text: string;
}

export interface ChatbotDto {
    message: string;
    history: ChatHistoryMessage[];
    cvId?: string;
}

@Injectable()
export class ChatbotService {
    private readonly logger = new Logger(ChatbotService.name);
    private readonly genAI: GoogleGenerativeAI;
    private readonly modelName: string;

    constructor(
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService,
        private readonly embeddingService: EmbeddingService,
    ) {
        const apiKey = this.configService.get<string>('ai.geminiApiKey');
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = this.configService.get<string>('ai.generationModel') || 'gemini-1.5-flash';
    }

    private getModel(jsonMode = false) {
        return this.genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                temperature: 0.4,
                responseMimeType: jsonMode ? 'application/json' : 'text/plain',
            },
        });
    }

    /**
     * Phương án 1: Hỏi đáp qua lại (Conversational RAG)
     */
    async chat(candidateId: string, dto: ChatbotDto) {
        const { message, history, cvId } = dto;
        this.logger.log(`Chatbot request from candidate ${candidateId}`);

        // 1. Lấy thông tin CV nếu có cvId để AI hiểu bối cảnh
        let cvContext = '';
        if (cvId) {
            try {
                const cv = await this.dataSource.getRepository(CandidateCv).findOne({
                    where: { id: cvId },
                    relations: ['experiences', 'skills', 'projects', 'educations']
                });
                if (cv) {
                    cvContext = `
Thông tin CV hiện tại của ứng viên:
- Tiêu đề CV: ${cv.cvTitle}
- Tóm tắt: ${cv.summary || ''}
- Kỹ năng: ${cv.skills?.map(s => s.name).join(', ') || ''}
- Kinh nghiệm: ${cv.experiences?.map(e => `${e.position} tại ${e.companyName}: ${e.description}`).join('; ') || ''}
- Dự án: ${cv.projects?.map(p => `${p.name}: ${p.techStack}`).join('; ') || ''}
                    `;
                }
            } catch (err) {
                this.logger.error(`Error loading CV context: ${err.message}`);
            }
        }

        // 2. Sử dụng Gemini để đánh giá xem có nên thực hiện tìm kiếm công việc (RAG) lúc này không.
        // Hướng dẫn AI phản hồi dưới dạng JSON có cấu trúc.
        const decisionPrompt = `
Bạn là một chuyên gia tuyển dụng công nghệ thông tin thân thiện. 
Nhiệm vụ của bạn là trò chuyện với ứng viên để hiểu về kỹ năng, kinh nghiệm, địa điểm làm việc và mức lương mong muốn của họ, từ đó gợi ý công việc phù hợp.

Dưới đây là bối cảnh cuộc trò chuyện:
${cvContext}

Lịch sử trò chuyện:
${history.map(h => `${h.role === 'user' ? 'Ứng viên' : 'Trợ lý'}: ${h.text}`).join('\n')}
Ứng viên: ${message}

Yêu cầu:
Phân tích xem ứng viên đã cung cấp đủ thông tin (hoặc trực tiếp yêu cầu gợi ý việc làm) để thực hiện tìm kiếm công việc hay chưa.
Trả về một đối tượng JSON duy nhất với cấu trúc sau:
{
  "shouldSearch": boolean, // Đặt là true nếu người dùng yêu cầu gợi ý việc làm HOẶC bạn đã có đủ thông tin (vị trí/kỹ năng + địa điểm làm việc mong muốn) để gợi ý việc làm phù hợp.
  "searchQuery": string | null, // Nếu shouldSearch là true, hãy tóm tắt các từ khóa tìm kiếm (Ví dụ: "ReactJS Developer Ho Chi Minh 2 years experience"). Nếu false, hãy để null.
  "replyMessage": string // Nếu shouldSearch là false, hãy viết một câu phản hồi thân thiện tiếp tục cuộc trò chuyện và hỏi các thông tin còn thiếu (ví dụ: kỹ năng chính, kinh nghiệm, địa điểm làm việc hoặc mức lương mong muốn). Nếu shouldSearch là true, hãy ghi một câu chào đón ngắn gọn trước khi hiển thị kết quả (Ví dụ: "Tôi đã tìm thấy một số công việc phù hợp với bạn dưới đây:").
}

Hãy trả về CHỈ định dạng JSON hợp lệ, không bọc trong markdown codeblock.
        `;

        try {
            const decisionModel = this.getModel(true);
            const decisionResult = await decisionModel.generateContent(decisionPrompt);
            const responseText = decisionResult.response.text();
            
            const decision = JSON.parse(responseText.trim());
            this.logger.log(`Chatbot decision: shouldSearch = ${decision.shouldSearch}, query = ${decision.searchQuery}`);

            let suggestedJobs = [];

            if (decision.shouldSearch && decision.searchQuery) {
                // 3. Thực hiện RAG: Tìm kiếm việc làm bằng Vector
                try {
                    const queryVector = await this.embeddingService.generateEmbedding(decision.searchQuery);
                    suggestedJobs = await this.searchJobsByVector(queryVector, 4);
                    
                    if (suggestedJobs.length > 0) {
                        // 4. Nếu tìm được job, dùng Gemini tạo câu trả lời tổng hợp giới thiệu các job này
                        const jobsContext = suggestedJobs.map((j, idx) => `
[Job ${idx + 1}]
ID: ${j.id}
Tiêu đề: ${j.title}
Công ty: ${j.companyName}
Địa điểm: ${j.workLocation}
Lương: ${j.minSalary ? `${j.minSalary} - ${j.maxSalary} USD` : 'Thỏa thuận'}
Mô tả: ${j.description?.substring(0, 300)}...
-------------------
                        `).join('\n');

                        const synthesisPrompt = `
Bạn là Trợ lý tuyển dụng AI. Dựa trên nhu cầu của ứng viên và danh sách công việc tìm được sau đây:

CÔNG VIỆC TÌM ĐƯỢC:
${jobsContext}

Yêu cầu của ứng viên: ${decision.searchQuery}

Hãy viết một phản hồi tự nhiên, chuyên nghiệp bằng tiếng Việt để giới thiệu các công việc trên cho ứng viên. 
Nêu bật lý do tại sao các công việc này phù hợp với họ. Khuyên họ ứng tuyển hoặc hỏi họ xem có muốn biết thêm chi tiết về vị trí nào không.
        `;
                        const synthesisModel = this.getModel(false);
                        const synthesisResult = await synthesisModel.generateContent(synthesisPrompt);
                        decision.replyMessage = synthesisResult.response.text();
                    } else {
                        decision.replyMessage = "Tôi đã tìm kiếm các công việc phù hợp với yêu cầu của bạn nhưng hiện tại chưa có tin tuyển dụng nào tương thích hoàn toàn. Bạn có muốn điều chỉnh lại kỹ năng hoặc địa điểm mong muốn không?";
                    }
                } catch (searchErr) {
                    this.logger.error(`Vector search failed in chatbot: ${searchErr.message}`);
                    if (searchErr.message?.includes('API key') || searchErr.message?.includes('key') || searchErr.message?.includes('403') || searchErr.message?.includes('Forbidden') || searchErr.message?.includes('API_KEY_INVALID')) {
                        throw searchErr; // Let the outer catch handle API Key errors
                    }
                    decision.replyMessage = "Rất tiếc, đã có lỗi xảy ra trong quá trình tìm kiếm công việc phù hợp. Bạn vui lòng thử lại sau nhé!";
                }
            }

            return {
                message: decision.replyMessage,
                suggestedJobs,
                shouldSearch: decision.shouldSearch
            };

        } catch (error) {
            this.logger.error(`Gemini chatbot process failed: ${error.message}`);
            
            let userFriendlyMsg = 'Rất tiếc, tôi đang gặp sự cố khi xử lý thông tin.';
            if (error.message?.includes('API key') || error.message?.includes('key') || error.message?.includes('403') || error.message?.includes('Forbidden') || error.message?.includes('API_KEY_INVALID')) {
                userFriendlyMsg = 'Hệ thống đang gặp sự cố kết nối với AI (Lỗi API Key không hợp lệ hoặc đã bị khóa do bị lộ). Vui lòng cập nhật API Key mới (biến GEMINI_API_KEY trong tệp backend/.env) để tiếp tục trò chuyện.';
            } else {
                userFriendlyMsg = `Đã xảy ra lỗi khi xử lý yêu cầu của bạn: ${error.message}. Vui lòng thử lại sau.`;
            }
            
            return {
                message: userFriendlyMsg,
                suggestedJobs: [],
                shouldSearch: false
            };
        }
    }

    /**
     * Phương án 2: Phân tích CV và gợi ý công việc phù hợp (CV RAG)
     */
    async suggestByCv(candidateId: string, cvId: string) {
        try {
            this.logger.log(`Suggesting jobs by CV ${cvId} for candidate ${candidateId}`);

            // 1. Lấy thông tin chi tiết CV
            const cv = await this.dataSource.getRepository(CandidateCv).findOne({
                where: { id: cvId },
                relations: ['experiences', 'skills', 'projects', 'educations', 'certifications']
            });
            if (!cv) {
                throw new NotFoundException('Không tìm thấy CV của ứng viên');
            }

            // 2. Đảm bảo CV đã có vector nhúng
            let cvEmbedding: number[];
            if (!cv.cvVector) {
                this.logger.log(`CV ${cvId} does not have vector. Generating...`);
                const contextText = `
                    Title: ${cv.cvTitle}
                    Summary: ${cv.summary || ''}
                    Experiences: ${cv.experiences?.map(e => `${e.position} at ${e.companyName}: ${e.description}`).join('. ') || ''}
                    Projects: ${cv.projects?.map(p => `${p.name} (${p.role}): ${p.techStack}`).join('. ') || ''}
                    Skills: ${cv.skills?.map(s => s.name).join(', ') || ''}
                `;
                try {
                    cvEmbedding = await this.embeddingService.generateEmbedding(contextText);
                    const embeddingStr = `[${cvEmbedding.join(',')}]`;
                    await this.dataSource.getRepository(CandidateCv).update(cv.id, {
                        cvVector: embeddingStr
                    } as any);
                } catch (err) {
                    this.logger.error(`Failed to generate embedding for CV: ${err.message}`);
                    let cvEmbedError = 'Không thể tạo vector phân tích cho CV này. Vui lòng kiểm tra lại cấu hình AI.';
                    if (err.message?.includes('API key') || err.message?.includes('key') || err.message?.includes('403') || err.message?.includes('Forbidden') || err.message?.includes('API_KEY_INVALID')) {
                        cvEmbedError = 'Không thể tạo vector phân tích cho CV (Lỗi API Key không hợp lệ hoặc đã bị khóa). Vui lòng cập nhật API Key mới (biến GEMINI_API_KEY trong file backend/.env).';
                    }
                    throw new Error(cvEmbedError);
                }
            } else {
                // Parse string '[0.1, 0.2, ...]' to float array
                const cleanVectorStr = cv.cvVector.replace('[', '').replace(']', '');
                cvEmbedding = cleanVectorStr.split(',').map(v => parseFloat(v));
            }

            // 3. Tìm kiếm công việc khớp bằng pgvector
            const suggestedJobs = await this.searchJobsByVector(cvEmbedding, 5);

            if (suggestedJobs.length === 0) {
                return {
                    analysis: 'Hiện tại hệ thống chưa có tin tuyển dụng nào phù hợp với hồ sơ CV của bạn. Hãy thử cập nhật thêm kỹ năng hoặc quay lại sau nhé!',
                    recommendations: [],
                    suggestedJobs: []
                };
            }

            // 4. Gọi Gemini để phân tích sự tương thích giữa CV và danh sách Job
            const cvBriefText = `
Tiêu đề: ${cv.cvTitle}
Tóm tắt: ${cv.summary || ''}
Kỹ năng: ${cv.skills?.map(s => s.name).join(', ')}
Kinh nghiệm: ${cv.experiences?.map(e => `${e.position} tại ${e.companyName}`).join(', ')}
            `;

            const jobsBriefText = suggestedJobs.map((j, idx) => `
[Công việc ${idx + 1}]
ID: ${j.id}
Tiêu đề: ${j.title}
Công ty: ${j.companyName}
Yêu cầu: ${j.description?.substring(0, 200)}...
            `).join('\n');

            const prompt = `
Bạn là chuyên gia tư vấn nghề nghiệp. Phân tích sự phù hợp giữa hồ sơ CV của ứng viên và danh sách công việc tìm được dưới đây.

HỒ SƠ CV:
${cvBriefText}

DANH SÁCH CÔNG VIỆC:
${jobsBriefText}

Hãy tạo phản hồi JSON có định dạng chính xác như sau:
{
  "analysis": "Lời nhận xét tổng quan về độ tương thích của CV ứng viên với các công việc tuyển dụng hiện tại (viết bằng tiếng Việt, khoảng 3-4 câu).",
  "recommendations": [
    {
      "jobId": "ID của công việc tương ứng",
      "matchReason": "Lý do cụ thể vì sao CV của ứng viên phù hợp với công việc này (ví dụ: trùng khớp kỹ năng A, kinh nghiệm B).",
      "highlightSkills": ["Kỹ năng 1", "Kỹ năng 2"] // Các kỹ năng chính ứng viên nên nêu bật/tập trung khi nộp đơn cho công việc này
    }
  ]
}

Hãy trả về CHỈ định dạng JSON hợp lệ, không bọc trong markdown codeblock.
            `;

            try {
                const analysisModel = this.getModel(true);
                const result = await analysisModel.generateContent(prompt);
                const responseText = result.response.text();
                const parsedAnalysis = JSON.parse(responseText.trim());

                return {
                    analysis: parsedAnalysis.analysis,
                    recommendations: parsedAnalysis.recommendations,
                    suggestedJobs
                };
            } catch (error) {
                this.logger.error(`Failed to analyze CV matching with Gemini: ${error.message}`);
                
                if (error.message?.includes('API key') || error.message?.includes('key') || error.message?.includes('403') || error.message?.includes('Forbidden') || error.message?.includes('API_KEY_INVALID')) {
                    throw new Error('Lỗi kết nối AI khi phân tích sự tương thích CV (API Key không hợp lệ hoặc đã bị khóa). Vui lòng cập nhật API Key mới (biến GEMINI_API_KEY trong file backend/.env).');
                }

                // Fallback response structure for other issues (e.g. JSON parse failure)
                return {
                    analysis: 'CV của bạn rất ấn tượng và có độ tương thích cao với các công việc công nghệ dưới đây. Dưới đây là danh sách chi tiết các công việc phù hợp nhất với bạn.',
                    recommendations: suggestedJobs.map(j => ({
                        jobId: j.id,
                        matchReason: 'Hồ sơ kỹ năng và kinh nghiệm của bạn phù hợp tốt với các yêu cầu cốt lõi của công việc này.',
                        highlightSkills: cv.skills?.slice(0, 3).map(s => s.name) || []
                    })),
                    suggestedJobs
                };
            }
        } catch (outerError) {
            this.logger.error(`suggestByCv failed: ${outerError.message}`);
            throw outerError; // Re-throw so frontend catch block triggers and shows alert
        }
    }

    /**
     * Helper tìm kiếm công việc bằng Vector thông qua pgvector
     */
    private async searchJobsByVector(vector: number[], limit = 5) {
        const embeddingStr = `[${vector.join(',')}]`;

        const results = await this.dataSource.query(
            `
            SELECT
                j.id,
                j.title,
                j.description,
                j.work_location AS "workLocation",
                j.min_salary AS "minSalary",
                j.max_salary AS "maxSalary",
                j.type,
                c.name AS "companyName",
                c.logo AS "companyLogo",
                1 - (j.jd_vector <=> $1::vector) AS "similarityScore"
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE j.jd_vector IS NOT NULL AND j.status = 'ACTIVE'
            ORDER BY j.jd_vector <=> $1::vector
            LIMIT $2
            `,
            [embeddingStr, limit],
        );

        return results.map((r) => ({
            ...r,
            similarityScore: parseFloat(r.similarityScore),
        }));
    }
}
