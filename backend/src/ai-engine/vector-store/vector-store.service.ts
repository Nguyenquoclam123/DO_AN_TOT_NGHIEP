import { Injectable, Logger, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class VectorStoreService {
    private readonly logger = new Logger(VectorStoreService.name);

    constructor(@Inject('REDIS_CLIENT') private redis: Redis) { }

    /**
     * Lưu trữ Job Vector vào Redis Stack
     * Cấu trúc key: job:vector:{jobId}
     */
    async upsertJobVector(data: { jobId: string, vector: number[], metadata: any }) {
        const key = `job:vector:${data.jobId}`;

        try {
            // Lưu vector dưới dạng Binary Buffer (HNSW/FLAT index trong Redis yêu cầu định dạng này)
            const vectorBuffer = Buffer.from(new Float32Array(data.vector).buffer);

            await this.redis.hset(key, {
                id: data.jobId,
                vector: vectorBuffer,
                metadata: JSON.stringify(data.metadata),
                createdAt: new Date().toISOString()
            });

            this.logger.log(`Successfully indexed job vector for ID: ${data.jobId}`);
        } catch (error) {
            this.logger.error(`Error saving job vector to Redis: ${error.message}`);
            throw error;
        }
    }

    /**
     * Truy vấn các Job tương tự dựa trên Vector (Sử dụng cho Candidate Matching)
     */
    async searchSimilarJobs(queryVector: number[], topK: number = 5) {
        // Logic cho FT.SEARCH trong Redis Stack để tìm KNN (K-Nearest Neighbors)
        // Tôi sẽ chuẩn bị sẵn hàm này cho bước Candidate Matching tiếp theo
    }
}
