import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 009: Kích hoạt extension pgvector
 * Yêu cầu: PostgreSQL >= 14 với pgvector đã cài đặt
 */
export class EnablePgvector1713600000009 implements MigrationInterface {
    name = 'EnablePgvector1713600000009';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Kích hoạt pgvector extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
        console.log('✅ pgvector extension enabled');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP EXTENSION IF EXISTS vector`);
    }
}
