
import { DataSource } from 'typeorm';
import { Question, QuestionOption, QuestionSet } from '../src/modules/question-bank/entities/question.entity';
import { JobPosition } from '../src/modules/master-data/entities/position.entity';
import { JobLevel } from '../src/modules/master-data/entities/level.entity';
import { Company } from '../src/modules/company/entities/company.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ats_db',
    entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
    synchronize: false,
});

async function run() {
    await AppDataSource.initialize();
    console.log('Database connected');

    await AppDataSource.query('TRUNCATE TABLE question_sets CASCADE');

    const questionSetRepo = AppDataSource.getRepository(QuestionSet);
    const questionRepo = AppDataSource.getRepository(Question);
    const optionRepo = AppDataSource.getRepository(QuestionOption);
    const positionRepo = AppDataSource.getRepository(JobPosition);
    const levelRepo = AppDataSource.getRepository(JobLevel);

    const positions = await positionRepo.find();
    const levels = await levelRepo.find();

    const saveSet = async (setData: any) => {
        const { questions, ...setInfo } = setData;
        const set = await questionSetRepo.save(questionSetRepo.create(setInfo)) as any;
        for (const qData of questions) {
            const { options, ...qInfo } = qData;
            const question = await questionRepo.save(questionRepo.create({
                ...qInfo,
                questionSetId: set.id
            })) as any;
            if (options) {
                await optionRepo.save(options.map((o: any) => optionRepo.create({ ...o, questionId: question.id })));
            }
        }
    };

    // --- 1. GLOBAL LOGIC SETS (5 SETS, 5 QS EACH) ---
    console.log('Generating Global Logic Sets...');
    const logicQuestions = [
        { q: 'Một con ốc sên leo lên một cái cột cao 10m. Ban ngày nó leo được 3m, ban đêm nó bị tuột xuống 2m. Hỏi sau bao lâu nó lên đến đỉnh?', a: '8 ngày', opts: ['10 ngày', '9 ngày', '8 ngày', '7 ngày'], exp: 'Vào ngày thứ 8, sau khi leo 3m từ mốc 7m (đạt được sau 7 ngày đêm), nó sẽ chạm đỉnh 10m và không bị tuột nữa.' },
        { q: 'Số nào tiếp theo: 1, 1, 2, 3, 5, 8, ...?', a: '13', opts: ['10', '12', '13', '15'], exp: 'Đây là dãy Fibonacci, số sau bằng tổng 2 số trước.' },
        { q: 'Nếu 3 con mèo bắt 3 con chuột trong 3 phút, thì 100 con mèo bắt 100 con chuột trong bao lâu?', a: '3 phút', opts: ['100 phút', '3 phút', '33 phút', '1 phút'], exp: 'Mỗi con mèo mất 3 phút để bắt 1 con chuột.' },
        { q: 'Ai là người phát minh ra ngôn ngữ lập trình C?', a: 'Dennis Ritchie', opts: ['Bill Gates', 'James Gosling', 'Dennis Ritchie', 'Bjarne Stroustrup'], exp: 'Dennis Ritchie phát triển C tại Bell Labs vào đầu thập niên 1970.' },
        { q: 'Trong IT, nguyên lý DRY viết tắt của điều gì?', a: 'Don\'t Repeat Yourself', opts: ['Do React Yearly', 'Don\'t Repeat Yourself', 'Data Ready Yield', 'Double Run Yield'], exp: 'DRY là nguyên tắc thiết kế phần mềm nhằm giảm bớt sự lặp lại của thông tin.' }
    ];

    for (let i = 1; i <= 5; i++) {
        await saveSet({
            name: `Tư duy & Logic Tổng hợp - Bộ ${i}`,
            category: 'Logic',
            description: 'Đánh giá chỉ số thông minh và khả năng giải quyết vấn đề kỹ thuật cơ bản.',
            positionId: null,
            levelId: null,
            questions: logicQuestions.map(l => ({
                content: l.q,
                type: 'MULTIPLE_CHOICE',
                difficulty: 'MEDIUM',
                options: l.opts.map(o => ({ optionText: o, isCorrect: o === l.a, explanation: o === l.a ? l.exp : 'Lựa chọn này chưa chính xác.' }))
            }))
        });
    }

    // --- 2. JOB & LEVEL SETS (5 SETS EACH) ---
    console.log('Generating Job & Level Matrix...');

    const getTechnicalQs = (jobName: string, levelName: string, setIdx: number) => {
        // Simple template factory to generate realistic text
        const topics: any = {
            'Backend': ['Tối ưu Query', 'Xử lý Concurrency', 'Caching Strategy', 'Auth & Security', 'Microservices'],
            'Frontend': ['React Lifecycle', 'State Management', 'Web Performance', 'Responsive Design', 'Modern CSS'],
            'Mobile': ['Memory Management', 'App Lifecycle', 'Offline Storage', 'UI Components', 'Push Notifications'],
            'DevOps': ['Docker Container', 'CI/CD Pipeline', 'Kubernetes Pods', 'Cloud Security', 'Monitoring'],
            'UI/UX': ['Design Principles', 'User Research', 'Prototyping', 'Accessibility', 'Visual Hierarchy'],
            'QA': ['Automation Testing', 'Bug Report', 'Regression Test', 'TDD/BDD', 'Load Testing'],
            'Data Scientist': ['Data Cleaning', 'ML Models', 'Statistics', 'Visualization', 'Big Data'],
            'Product Manager': ['Roadmap Planning', 'Agile/Scrum', 'User Stories', 'KPI Tracking', 'Market Analysis'],
            'BrSE': ['Requirement Analysis', 'Bridge Communication', 'Quy trình thác nước', 'Quản lý rủi ro', 'Văn hóa làm việc Nhật']
        };

        const jobTopics = topics[jobName] || ['General Knowledge', 'Best Practices', 'Soft Skills', 'Problem Solving', 'Tools'];
        
        return jobTopics.map((topic: string, i: number) => ({
            content: `[${jobName} - ${levelName}] Câu hỏi về ${topic} (Bộ ${setIdx}): Bạn sẽ xử lý như thế nào trong tình huống thực tế liên quan đến ${topic} để đạt hiệu quả tốt nhất cho dự án?`,
            type: i % 2 === 0 ? 'MULTIPLE_CHOICE' : 'ESSAY',
            difficulty: levelName.includes('Senior') || levelName.includes('Lead') ? 'HARD' : 'MEDIUM',
            options: i % 2 === 0 ? [
                { optionText: `Giải pháp tối ưu A cho ${topic}`, isCorrect: true, explanation: `Giải pháp này tuân thủ các best practices về ${topic}.` },
                { optionText: `Giải pháp B (Tạm chấp nhận)`, isCorrect: false, explanation: `Giải pháp này có thể gây ra lỗi về lâu dài.` },
                { optionText: `Giải pháp C (Không khuyến khích)`, isCorrect: false, explanation: `Không nên sử dụng cách này vì vi phạm nguyên tắc bảo mật.` },
                { optionText: `Giải pháp D (Sai hoàn toàn)`, isCorrect: false, explanation: `Lựa chọn này không giải quyết được vấn đề.` }
            ] : []
        }));
    };

    for (const pos of positions) {
        for (const lvl of levels) {
            console.log(`- Seeding ${pos.name} - ${lvl.name}`);
            for (let i = 1; i <= 5; i++) {
                await saveSet({
                    name: `Bộ đề ${pos.name} - ${lvl.name} - Chuyên sâu ${i}`,
                    category: 'Technical',
                    description: `Đánh giá năng lực kỹ thuật thực tế cho vị trí ${pos.name} cấp độ ${lvl.name}.`,
                    positionId: pos.id,
                    levelId: lvl.id,
                    questions: getTechnicalQs(pos.name, lvl.name, i)
                });
            }
        }
    }

    console.log('Massive Realistic Seeding completed!');
    await AppDataSource.destroy();
}

run().catch(console.error);
