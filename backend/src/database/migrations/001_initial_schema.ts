import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1713600000001 implements MigrationInterface {
  name = 'InitialSchema1713600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng Users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "full_name" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'CANDIDATE',
        "phone_number" character varying,
        "avatar_url" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "company_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_97327732292351d198592671" UNIQUE ("email")
      )
    `);

    // Tạo bảng Companies
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "industry" character varying,
        "size" character varying,
        "logo_url" character varying,
        "website" character varying,
        "description" text,
        "is_verified" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_d03213ef_company" PRIMARY KEY ("id")
      )
    `);

    // Tạo bảng Jobs
    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "requirements" text,
        "min_salary" decimal,
        "max_salary" decimal,
        "location" character varying,
        "work_type" character varying,
        "experience_years" integer,
        "status" character varying NOT NULL DEFAULT 'DRAFT',
        "company_id" uuid NOT NULL,
        "campaign_id" uuid,
        "level_id" uuid,
        "position_id" uuid,
        "expires_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_job_id" PRIMARY KEY ("id")
      )
    `);

    // Tạo bảng CVs
    await queryRunner.query(`
      CREATE TABLE "cvs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "file_url" character varying NOT NULL,
        "file_size" integer,
        "parsed_text" text,
        "is_primary" boolean NOT NULL DEFAULT false,
        "is_embedded" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cv_id" PRIMARY KEY ("id")
      )
    `);

    // Tạo bảng Applications
    await queryRunner.query(`
      CREATE TABLE "applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "job_id" uuid NOT NULL,
        "candidate_id" uuid NOT NULL,
        "cv_id" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'APPLIED',
        "ai_score" decimal,
        "ai_reasoning" text,
        "ai_processed_at" TIMESTAMP,
        "ai_model_used" character varying,
        "employer_feedback" integer,
        "feedback_note" text,
        "pipeline_stage_id" uuid,
        "cover_letter" text,
        "applied_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_application_id" PRIMARY KEY ("id")
      )
    `);

    // Đảm bảo có extension uuid-ossp
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TABLE "cvs"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
