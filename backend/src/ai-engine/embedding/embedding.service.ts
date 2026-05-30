import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingService {
    private readonly logger = new Logger(EmbeddingService.name);
    private readonly genAI: GoogleGenerativeAI;
    private readonly embeddingModel: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('ai.geminiApiKey');
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.embeddingModel = this.configService.get<string>('ai.embeddingModel') || 'text-embedding-004';
    }

    /**
     * Tạo embedding vector từ văn bản
     * @param text - Nội dung cần embed (CV text hoặc JD text)
     * @returns float[] - Vector 768 chiều
     */
    async generateEmbedding(text: string): Promise<number[]> {
        const start = Date.now();
        try {
            const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });
            const outputDimensionality = this.configService.get<number>('ai.embeddingDimension') || 3072;

            // Truncate nếu text quá dài
            const truncatedText = text.slice(0, 8000);

            const result = await model.embedContent({
                content: { parts: [{ text: truncatedText }], role: 'user' },
                outputDimensionality
            } as any);
            const embedding = result.embedding.values;

            this.logger.log(
                `Embedding generated: ${embedding.length} dims in ${Date.now() - start}ms`,
            );

            return embedding;
        } catch (error) {
            this.logger.error('Embedding generation failed', error);
            throw error;
        }
    }

    /**
     * Tạo embedding cho nhiều văn bản cùng lúc (batch)
     */
    async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
        const embeddings = await Promise.all(
            texts.map((text) => this.generateEmbedding(text)),
        );
        return embeddings;
    }
}
