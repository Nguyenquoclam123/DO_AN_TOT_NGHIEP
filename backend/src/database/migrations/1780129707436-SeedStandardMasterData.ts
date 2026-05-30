import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedStandardMasterData1780129707436 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Seed standard levels (company_id is null)
        await queryRunner.query(`
            INSERT INTO "levels" ("id", "name", "level", "description", "company_id", "is_active") VALUES
            (uuid_generate_v4(), 'Intern', 1, 'Thực tập sinh', NULL, true),
            (uuid_generate_v4(), 'Fresher/Junior', 2, 'Nhân viên mới/Dưới 2 năm kinh nghiệm', NULL, true),
            (uuid_generate_v4(), 'Middle', 3, 'Nhân viên có từ 2-4 năm kinh nghiệm', NULL, true),
            (uuid_generate_v4(), 'Senior', 4, 'Nhân viên dày dạn kinh nghiệm (từ 5 năm)', NULL, true),
            (uuid_generate_v4(), 'Lead/Manager', 5, 'Trưởng nhóm / Quản lý bộ phận', NULL, true)
        `);

        // Seed standard positions (company_id is null)
        await queryRunner.query(`
            INSERT INTO "positions" ("id", "name", "description", "company_id", "is_active") VALUES
            (uuid_generate_v4(), 'Backend Developer', 'Lập trình viên Backend', NULL, true),
            (uuid_generate_v4(), 'Frontend Developer', 'Lập trình viên Frontend', NULL, true),
            (uuid_generate_v4(), 'Fullstack Developer', 'Lập trình viên Fullstack', NULL, true),
            (uuid_generate_v4(), 'Mobile Developer', 'Lập trình viên di động (iOS/Android)', NULL, true),
            (uuid_generate_v4(), 'DevOps Engineer', 'Kỹ sư tối ưu vận hành & đám mây', NULL, true),
            (uuid_generate_v4(), 'QA/QC Engineer', 'Kỹ sư kiểm thử chất lượng phần mềm', NULL, true),
            (uuid_generate_v4(), 'UI/UX Designer', 'Thiết kế giao diện và trải nghiệm người dùng', NULL, true),
            (uuid_generate_v4(), 'Data Analyst/Data Scientist', 'Phân tích dữ liệu & Khoa học dữ liệu', NULL, true),
            (uuid_generate_v4(), 'Project Manager', 'Quản trị dự án công nghệ', NULL, true),
            (uuid_generate_v4(), 'Product Owner/Product Manager', 'Quản lý sản phẩm công nghệ', NULL, true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Clean up standard levels (where company_id is null)
        await queryRunner.query(`DELETE FROM "levels" WHERE "company_id" IS NULL`);

        // Clean up standard positions (where company_id is null)
        await queryRunner.query(`DELETE FROM "positions" WHERE "company_id" IS NULL`);
    }

}

