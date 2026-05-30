import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
    geminiApiKey: process.env.GEMINI_API_KEY,
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
    generationModel: process.env.GEMINI_GENERATION_MODEL || 'gemini-1.5-pro',
    embeddingDimension: 3072,
    maxTokensPerRequest: parseInt(process.env.AI_MAX_TOKENS, 10) || 8192,
    temperatureDefault: parseFloat(process.env.AI_TEMPERATURE) || 0.3,
}));
