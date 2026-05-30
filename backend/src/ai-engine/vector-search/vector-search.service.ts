import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VectorStorage } from '../entities/vector-storage.entity';

export interface VectorSearchResult {
    id: string;
    similarityScore: number;
    [key: string]: any;
}

@Injectable()
export class VectorSearchService {
    private readonly logger = new Logger(VectorSearchService.name);

    constructor(private dataSource: DataSource) { }

    /**
     * ⭐ Lưu Vector vào bảng tập trung vector_storage
     */
    async saveVector(data: {
        refId: string;
        refType: string;
        contentType?: string;
        rawContent: string;
        embedding: number[];
    }) {
        try {
            const vectorStorageRepo = this.dataSource.getRepository(VectorStorage);
            const embeddingStr = `[${data.embedding.join(',')}]`;
            
            const newRecord = vectorStorageRepo.create({
                refId: data.refId,
                refType: data.refType,
                contentType: data.contentType,
                rawContent: data.rawContent,
                embedding: embeddingStr
            });

            await vectorStorageRepo.save(newRecord);
            this.logger.log(`Saved vector to storage for ${data.refType}: ${data.refId}`);
        } catch (error) {
            this.logger.error(`Failed to save vector to storage: ${error.message}`);
        }
    }

    /**
     * ⭐ Tìm CV phù hợp nhất với một Job (dùng cho AI Scoring)
     */
    async findTopCandidatesForJob(
        jobId: string,
        jobEmbedding: number[],
        limit = 20,
    ): Promise<VectorSearchResult[]> {
        const embeddingStr = `[${jobEmbedding.join(',')}]`;

        const results = await this.dataSource.query(
            `
      SELECT
        a.id            AS application_id,
        a.candidate_id,
        c.first_name || ' ' || c.last_name AS full_name,
        cv.cv_title,
        1 - (cv.cv_vector <=> $1::vector) AS similarity_score
      FROM applications a
      JOIN candidate_cvs cv ON a.cv_id = cv.id
      JOIN candidates c     ON a.candidate_id = c.id
      WHERE a.job_id = $2
        AND cv.cv_vector IS NOT NULL
      ORDER BY cv.cv_vector <=> $1::vector
      LIMIT $3
    `,
            [embeddingStr, jobId, limit],
        );

        return results.map((r) => ({
            ...r,
            similarityScore: parseFloat(r.similarity_score),
        }));
    }

    /**
     * ⭐ Tìm Job phù hợp với CV của Candidate (recommendation)
     */
    async findMatchingJobsForCv(
        cvEmbedding: number[],
        limit = 10,
    ): Promise<VectorSearchResult[]> {
        const embeddingStr = `[${cvEmbedding.join(',')}]`;

        const results = await this.dataSource.query(
            `
      SELECT
        j.id,
        j.title,
        j.work_location,
        c.name AS company_name,
        1 - (j.jd_vector <=> $1::vector) AS similarity_score
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE j.jd_vector IS NOT NULL
      ORDER BY j.jd_vector <=> $1::vector
      LIMIT $2
    `,
            [embeddingStr, limit],
        );

        return results.map((r) => ({
            ...r,
            similarityScore: parseFloat(r.similarity_score),
        }));
    }

    /**
     * Tìm CV tương tự trong Talent Pool
     */
    async findSimilarCvsInTalentPool(
        embedding: number[],
        companyId: string,
        limit = 10,
    ): Promise<VectorSearchResult[]> {
        const embeddingStr = `[${embedding.join(',')}]`;

        return this.dataSource.query(
            `
      SELECT
        tp.id AS talent_pool_id,
        c.id  AS candidate_id,
        c.first_name || ' ' || c.last_name AS full_name,
        cv.cv_title AS cv_name,
        1 - (cv.cv_vector <=> $1::vector) AS similarity_score
      FROM talent_pool tp
      JOIN candidates c     ON tp.candidate_id = c.id
      JOIN candidate_cvs cv ON cv.candidate_id = c.id AND cv.is_primary = true
      WHERE tp.company_id = $2
        AND cv.cv_vector IS NOT NULL
      ORDER BY cv.cv_vector <=> $1::vector
      LIMIT $3
    `,
            [embeddingStr, companyId, limit],
        );
    }
}
