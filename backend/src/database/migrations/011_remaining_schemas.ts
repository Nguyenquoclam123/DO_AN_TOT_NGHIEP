import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemainingSchemas1713600000020 implements MigrationInterface {
    name = 'RemainingSchemas1713600000020';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Master Data
        await queryRunner.query(`CREATE TABLE "levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_level_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_position_id" PRIMARY KEY ("id"))`);

        // Campaign
        await queryRunner.query(`CREATE TABLE "campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "company_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_campaign_id" PRIMARY KEY ("id"))`);

        // Pipeline
        await queryRunner.query(`CREATE TABLE "pipeline_stages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "orderIndex" integer NOT NULL, "jobId" uuid NOT NULL, CONSTRAINT "PK_pipeline_stage_id" PRIMARY KEY ("id"))`);

        // Talent Pool & Interview
        await queryRunner.query(`CREATE TABLE "talent_pool" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "candidateId" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_talent_pool_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "applicationId" uuid NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "meetingLink" character varying, CONSTRAINT "PK_interview_id" PRIMARY KEY ("id"))`);

        // Chat
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "senderId" uuid NOT NULL, "receiverId" uuid NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_message_id" PRIMARY KEY ("id"))`);

        // AI Engine Tables
        await queryRunner.query(`
      CREATE TABLE "ai_processing_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "application_id" uuid,
        "action_type" character varying NOT NULL,
        "model_used" character varying NOT NULL,
        "prompt_tokens" integer DEFAULT 0,
        "completion_tokens" integer DEFAULT 0,
        "total_tokens" integer DEFAULT 0,
        "cost_usd" decimal(10,6) DEFAULT 0,
        "latency_ms" integer DEFAULT 0,
        "is_success" boolean DEFAULT true,
        "error_message" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_log_id" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE TABLE "ai_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying,
        "modelName" character varying NOT NULL,
        "promptTemplate" text NOT NULL,
        "isActive" boolean DEFAULT true,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_config_id" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE TABLE "ai_feedbacks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "applicationId" uuid,
        "rating" integer NOT NULL,
        "comment" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_feedback_id" PRIMARY KEY ("id")
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ai_feedbacks"`);
        await queryRunner.query(`DROP TABLE "ai_configs"`);
        await queryRunner.query(`DROP TABLE "ai_processing_logs"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "interviews"`);
        await queryRunner.query(`DROP TABLE "talent_pool"`);
        await queryRunner.query(`DROP TABLE "pipeline_stages"`);
        await queryRunner.query(`DROP TABLE "campaigns"`);
        await queryRunner.query(`DROP TABLE "positions"`);
        await queryRunner.query(`DROP TABLE "levels"`);
    }
}
