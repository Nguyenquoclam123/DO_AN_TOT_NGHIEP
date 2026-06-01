import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 013: Thêm cột file_url vào bảng candidate_cvs để lưu đường dẫn PDF gốc
 */
export class AddFileUrlToCvs1713600000013 implements MigrationInterface {
  name = 'AddFileUrlToCvs1713600000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "candidate_cvs"
      ADD COLUMN IF NOT EXISTS "file_url" character varying
    `);
    console.log('✅ Column file_url added to candidate_cvs table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "candidate_cvs"
      DROP COLUMN IF EXISTS "file_url"
    `);
  }
}
