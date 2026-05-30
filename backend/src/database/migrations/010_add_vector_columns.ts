import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 010: Thêm vector columns vào bảng jobs và cvs
 * Sử dụng kiểu vector(768) của pgvector — Gemini embedding-004 dimension
 */
export class AddVectorColumns1713600000010 implements MigrationInterface {
  name = 'AddVectorColumns1713600000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm embedding column vào bảng jobs
    await queryRunner.query(`
      ALTER TABLE jobs
      ADD COLUMN IF NOT EXISTS embedding vector(768)
    `);

    // Thêm embedding column vào bảng cvs
    await queryRunner.query(`
      ALTER TABLE cvs
      ADD COLUMN IF NOT EXISTS embedding vector(768)
    `);

    // Tạo IVFFlat index cho jobs (tăng tốc Approximate Nearest Neighbor search)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_embedding
      ON jobs USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);

    // Tạo IVFFlat index cho cvs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cvs_embedding
      ON cvs USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);

    console.log('✅ Vector columns and indexes created for jobs and cvs');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_jobs_embedding`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_cvs_embedding`);
    await queryRunner.query(`ALTER TABLE jobs DROP COLUMN IF EXISTS embedding`);
    await queryRunner.query(`ALTER TABLE cvs DROP COLUMN IF EXISTS embedding`);
  }
}
