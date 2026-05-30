import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterSchemaUpdate1713600000030 implements MigrationInterface {
    name = 'MasterSchemaUpdate1713600000030';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Cập nhật bảng JOBS (đã có)
        await queryRunner.query(`ALTER TABLE "jobs" RENAME COLUMN "embedding" TO "jd_vector"`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "industry_id" uuid`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "quantity" integer DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "work_time" character varying`);
        await queryRunner.query(`ALTER TABLE "jobs" RENAME COLUMN "min_salary" TO "salary_min"`);
        await queryRunner.query(`ALTER TABLE "jobs" RENAME COLUMN "max_salary" TO "salary_max"`);

        // 2. Cập nhật bảng COMPANIES (đã có)
        await queryRunner.query(`ALTER TABLE "companies" ADD "tax_code" character varying`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "cover_url" character varying`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "industry_id" uuid`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "scale" character varying`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "map_location" jsonb`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "user_id" uuid`);

        // 3. Cập nhật bảng APPLICATIONS (đã có)
        await queryRunner.query(`ALTER TABLE "applications" RENAME COLUMN "ai_score" TO "matching_score"`);
        await queryRunner.query(`ALTER TABLE "applications" ADD "current_pipeline_step_id" uuid`);

        // 4. Cập nhật và đổi tên Pipeline (stages -> steps) theo yêu cầu
        await queryRunner.query(`ALTER TABLE "pipeline_stages" RENAME TO "pipeline_steps"`);
        await queryRunner.query(`ALTER TABLE "pipeline_steps" RENAME COLUMN "orderIndex" TO "order_number"`);
        await queryRunner.query(`ALTER TABLE "pipeline_steps" RENAME COLUMN "jobId" TO "application_id"`);
        await queryRunner.query(`ALTER TABLE "pipeline_steps" RENAME COLUMN "name" TO "step_name"`);
        await queryRunner.query(`ALTER TABLE "pipeline_steps" ADD "is_default" boolean DEFAULT false`);

        // 5. Cập nhật AI Configs
        await queryRunner.query(`ALTER TABLE "ai_configs" RENAME TO "ai_models_config"`);
        await queryRunner.query(`ALTER TABLE "ai_models_config" RENAME COLUMN "modelName" TO "model_name"`);
        await queryRunner.query(`ALTER TABLE "ai_models_config" RENAME COLUMN "promptTemplate" TO "system_prompt"`);
        await queryRunner.query(`ALTER TABLE "ai_models_config" ADD "version" character varying`);
        await queryRunner.query(`ALTER TABLE "ai_models_config" ADD "provider" character varying`);
        await queryRunner.query(`ALTER TABLE "ai_models_config" ADD "temperature" float DEFAULT 0.3`);
        await queryRunner.query(`ALTER TABLE "ai_models_config" ADD "max_tokens" integer DEFAULT 4096`);

        // 6. Cập nhật Messages (phụ thuộc vào ChatRooms)
        await queryRunner.query(`CREATE TABLE "chat_rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_chat_room" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME COLUMN "senderId" TO "sender_id"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME COLUMN "receiverId" TO "room_id"`); // Tạm đổi tên cột để khớp logic room
        await queryRunner.query(`ALTER TABLE "messages" RENAME COLUMN "content" TO "message_text"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "sender_type" character varying`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "attachment_url" character varying`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "is_read" boolean DEFAULT false`);

        // 7. Tạo mới các bảng chưa có
        await queryRunner.query(`CREATE TABLE "job_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "company_id" uuid, CONSTRAINT "PK_job_cat" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "skill_name" character varying NOT NULL, "is_required" boolean DEFAULT true, CONSTRAINT "PK_job_skills" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_requirements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "required_position" character varying, "min_years" integer, "industry_context" character varying, CONSTRAINT "PK_job_requirements" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_education_req" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "required_degree" character varying, "preferred_major" character varying, CONSTRAINT "PK_job_edu_req" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_certificates_req" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "cert_name" character varying, "is_mandatory" boolean DEFAULT false, CONSTRAINT "PK_job_cert_req" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_experiences_req" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "question_set_id" uuid, CONSTRAINT "PK_job_exp_req" PRIMARY KEY ("id"))`);

        // Candidates & CVs
        await queryRunner.query(`CREATE TABLE "candidates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "address" character varying, "user_id" uuid NOT NULL, CONSTRAINT "PK_candidates" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "candidate_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_id" uuid NOT NULL, "password_hash" character varying NOT NULL, "last_login" TIMESTAMP, "fcm_token" character varying, CONSTRAINT "PK_candidate_accounts" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "candidate_cvs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_id" uuid NOT NULL, "cv_title" character varying NOT NULL, "summary" text, "cv_vector" vector(768), "is_primary" boolean DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "avatar" character varying, CONSTRAINT "PK_candidate_cvs" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv_experiences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "company_name" character varying NOT NULL, "position" character varying NOT NULL, "start_date" date, "end_date" date, "is_current" boolean DEFAULT false, "description" text, CONSTRAINT "PK_cv_experiences" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv_educations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "school_name" character varying NOT NULL, "major" character varying, "degree" character varying, "start_date" date, "end_date" date, "gpa" decimal(3,2), CONSTRAINT "PK_cv_educations" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "skill_name" character varying NOT NULL, "level" character varying, CONSTRAINT "PK_cv_skills" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv_certificates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "certificate_name" character varying NOT NULL, "organization" character varying, "issue_date" date, "url" character varying, CONSTRAINT "PK_cv_certificates" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv_projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "project_name" character varying NOT NULL, "role" character varying, "description" text, "technology_stack" character varying, "url" character varying, CONSTRAINT "PK_cv_projects" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "saved_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_id" uuid NOT NULL, "job_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_saved_jobs" PRIMARY KEY ("id"))`);

        // Application History & Answers
        await queryRunner.query(`CREATE TABLE "application_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "from_step_id" uuid, "to_step_id" uuid NOT NULL, "changed_by" uuid NOT NULL, "changed_at" TIMESTAMP NOT NULL DEFAULT now(), "note" text, CONSTRAINT "PK_application_history" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "question_id" uuid NOT NULL, "selected_option_id" uuid, "text_answer" text, CONSTRAINT "PK_app_answers" PRIMARY KEY ("id"))`);

        // Staff & Companies Extra
        await queryRunner.query(`CREATE TABLE "staffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "full_name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "phone" character varying, "role" character varying NOT NULL, "status" character varying DEFAULT 'ACTIVE', CONSTRAINT "PK_staffs" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company_galleries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "image_url" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_company_galleries" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "industries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_industries" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "plan_name" character varying NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "max_job_post" integer, "max_ai_scan" integer, CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id"))`);

        // AI & Storage
        await queryRunner.query(`CREATE TABLE "ai_evaluation_metrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "ai_score" decimal, "hr_review_score" decimal, "score_variance" decimal, "is_potential_flag" boolean DEFAULT false, "hr_decision" character varying, "hr_notes" text, CONSTRAINT "PK_ai_evaluation_metrics" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vector_storage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ref_id" uuid NOT NULL, "ref_type" character varying NOT NULL, "content_type" character varying, "raw_content" text, "embedding" vector(768), CONSTRAINT "PK_vector_storage" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "receiver_id" uuid NOT NULL, "receiver_type" character varying, "sender_id" uuid, "noti_type" character varying, "title" character varying, "content" text, "reference_id" uuid, "link_to" character varying, "is_read" boolean DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_notifications" PRIMARY KEY ("id"))`);

        // Questionnaire
        await queryRunner.query(`CREATE TABLE "questionnaire_sets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category_id" uuid, "level_id" uuid, "name" character varying NOT NULL, "description" text, CONSTRAINT "PK_questionnaire_sets" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "set_id" uuid NOT NULL, "content" text NOT NULL, "type" character varying NOT NULL, "weight" float DEFAULT 1.0, "ai_reference_answer" text, CONSTRAINT "PK_questions" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "option_text" text NOT NULL, "is_correct" boolean DEFAULT false, CONSTRAINT "PK_question_options" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}
