import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private readonly genAI: GoogleGenerativeAI;
    private readonly model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('ai.geminiApiKey');
        this.genAI = new GoogleGenerativeAI(apiKey);
        const generationModel = this.configService.get<string>('ai.generationModel') || 'gemini-1.5-flash';
        this.model = this.genAI.getGenerativeModel({ model: generationModel });
    }

    /**
     * Sử dụng Gemini để trích xuất thông tin có cấu trúc từ JD thô
     */
    async analyzeJobDescription(description: string) {
        const prompt = `
      Analyze the following Job Description and extract information in JSON format:
      - skills: string[] (List of technical and soft skills)
      - keyRequirements: string (Brief summary of critical requirements)
      - fitScoreBasis: string (What type of candidate profiles would be a best fit)

      Job Description: ${description}
      
      Response must be ONLY a valid JSON object.
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            // Tìm và trích xuất JSON từ response text (phòng trường hợp AI bọc trong Markdown)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return JSON.parse(responseText);
        } catch (error) {
            this.logger.error('Failed to analyze JD with Gemini:', error.message);
            return {
                skills: [],
                keyRequirements: description.substring(0, 200),
                fitScoreBasis: 'General match'
            };
        }
    }

    /**
     * Sử dụng Gemini để phân tích CV so với JD và đưa ra gợi ý tối ưu
     */
    async analyzeCVAgainstJob(cvContent: string, jobContent: string) {
        const prompt = `
      You are an expert HR Consultant and Resume Builder. 
      Analyze the following Candidate CV against the Job Description (JD).
      
      JOB DESCRIPTION:
      ${jobContent}

      CANDIDATE CV:
      ${cvContent}

      Tasks:
      1. Calculate a fit score (0-100).
      2. Identify matching skills and missing skills.
      3. Provide 3-5 specific, actionable suggestions to improve the CV content (Experience descriptions, Skill highlights) to better align with this JD.
      4. Rewrite the 'Summary' section of the CV to be more compelling for this specific role.

      Response must be ONLY a valid JSON object with this structure:
      {
        "fitScore": number,
        "matchingSkills": string[],
        "missingSkills": string[],
        "analysis": string,
        "suggestions": string[],
        "optimizedSummary": string
      }
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(responseText);
        } catch (error) {
            this.logger.error('Failed to optimize CV with Gemini:', error.message);
            throw new Error('AI Analysis failed. Please try again later.');
        }
    }
}
