import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CandidateCv } from './entities/candidate-cv.entity';
import { CvExperience } from './entities/cv-experience.entity';
import { CvEducation } from './entities/cv-education.entity';
import { CvSkill } from './entities/cv-skill.entity';
import { CvProject } from './entities/cv-project.entity';
import { CvCertification } from './entities/cv-certification.entity';
import { PromptService } from '../../ai-engine/prompt-engineering/prompt.service';
import { EmbeddingService } from '../../ai-engine/embedding/embedding.service';
import { VectorSearchService } from '../../ai-engine/vector-search/vector-search.service';
import { Job } from '../job/entities/job.entity';

@Injectable()
export class CvService {
    private readonly logger = new Logger(CvService.name);

    constructor(
        @InjectRepository(CandidateCv)
        private readonly cvRepository: Repository<CandidateCv>,
        @InjectRepository(CvProject)
        private readonly projectRepository: Repository<CvProject>,
        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>,
        private readonly promptService: PromptService,
        private readonly embeddingService: EmbeddingService,
        private readonly vectorSearchService: VectorSearchService,
        private readonly dataSource: DataSource,
    ) { }

    async uploadAndParse(candidateId: string, cvTitle: string, fileText: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const parsedData = await this.promptService.parseCv(fileText);
            const cv = queryRunner.manager.create(CandidateCv, {
                candidateId,
                cvTitle,
                summary: parsedData.summary,
                cvVector: null,
                isPrimary: true
            });
            const savedCv = await queryRunner.manager.save(cv);

            // Generate embedding in background or try-catch to not block save
            try {
                const vector = await this.embeddingService.generateEmbedding(fileText);
                
                // 1. Update direct column
                await queryRunner.manager.update(CandidateCv, savedCv.id, {
                    cvVector: `[${vector.join(',')}]`
                });

                // 2. ⭐ Also save to centralized vector_storage table
                await this.vectorSearchService.saveVector({
                    refId: savedCv.id,
                    refType: 'CV',
                    contentType: 'CV_RAW_TEXT',
                    rawContent: fileText.substring(0, 5000), // Limit raw content size
                    embedding: vector
                });
            } catch (e) {
                this.logger.error(`Failed to generate embedding for CV ${savedCv.id}: ${e.message}`);
            }

            if (parsedData.experiences) {
                const exps = parsedData.experiences.map((exp: any) =>
                    queryRunner.manager.create(CvExperience, {
                        ...exp,
                        cvId: savedCv.id,
                        companyName: exp.company_name || exp.companyName, // Map snake_case from AI to camelCase
                        isCurrent: exp.is_current || exp.isCurrent || false,
                        startDate: exp.start_date || exp.startDate || null,
                        endDate: exp.end_date || exp.endDate || null
                    })
                );
                await queryRunner.manager.save(exps);
            }

            if (parsedData.educations) {
                const edus = parsedData.educations.map((edu: any) =>
                    queryRunner.manager.create(CvEducation, {
                        ...edu,
                        cvId: savedCv.id,
                        schoolName: edu.school_name || edu.schoolName,
                        startDate: edu.start_date || edu.startDate || null,
                        endDate: edu.end_date || edu.endDate || null
                    })
                );
                await queryRunner.manager.save(edus);
            }

            if (parsedData.skills) {
                const skills = parsedData.skills.map((skill: any) =>
                    queryRunner.manager.create(CvSkill, {
                        cvId: savedCv.id,
                        name: skill.skill_name, // Map skill_name to name
                        level: skill.level
                    })
                );
                await queryRunner.manager.save(skills);
            }

            if (parsedData.projects) {
                const projs = parsedData.projects.map((proj: any) =>
                    queryRunner.manager.create(CvProject, {
                        cvId: savedCv.id,
                        name: proj.name,
                        role: proj.role,
                        techStack: proj.tech_stack || proj.techStack,
                        url: proj.url
                    })
                );
                await queryRunner.manager.save(projs);
            }

            if (parsedData.certifications) {
                const certs = parsedData.certifications.map((cert: any) =>
                    queryRunner.manager.create(CvCertification, {
                        cvId: savedCv.id,
                        name: cert.name,
                        organization: cert.organization || null,
                        issueDate: cert.issue_date || cert.issueDate || null,
                        expiryDate: cert.expiry_date || cert.expiryDate || null,
                        credentialId: cert.credential_id || cert.credentialId || null,
                        credentialUrl: cert.credential_url || cert.credentialUrl || null
                    })
                );
                await queryRunner.manager.save(certs);
            }

            await queryRunner.commitTransaction();
            return savedCv;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async uploadAndParsePdf(candidateId: string, file: Express.Multer.File) {
        let fileText = '';
        try {
            const data = await pdfParse(file.buffer);
            fileText = data.text;
        } catch (e) {
            this.logger.error(`Failed to extract text from PDF: ${e.message}`);
            throw new BadRequestException('Failed to read PDF file. Make sure it is not corrupted and contains selectable text.');
        }

        if (!fileText || fileText.trim().length === 0) {
            throw new BadRequestException('The uploaded PDF contains no text. Scanned documents or images are not supported.');
        }

        const fs = require('fs');
        const path = require('path');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(file.originalname);
        const filename = `cv-${uniqueSuffix}${fileExt}`;
        const uploadDir = path.join(process.cwd(), 'uploads');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        const fileUrl = `/upload/file/${filename}`;

        const existingPrimary = await this.cvRepository.findOne({
            where: { candidateId, isPrimary: true }
        });
        const makePrimary = !existingPrimary;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const parsedData = await this.promptService.parseCv(fileText);
            const cv = queryRunner.manager.create(CandidateCv, {
                candidateId,
                cvTitle: file.originalname.replace(/\.[^/.]+$/, ""),
                summary: parsedData.summary,
                cvVector: null,
                isPrimary: makePrimary,
                fileUrl: fileUrl
            });
            const savedCv = await queryRunner.manager.save(cv);

            try {
                const vector = await this.embeddingService.generateEmbedding(fileText);
                await queryRunner.manager.update(CandidateCv, savedCv.id, {
                    cvVector: `[${vector.join(',')}]`
                });

                await this.vectorSearchService.saveVector({
                    refId: savedCv.id,
                    refType: 'CV',
                    contentType: 'CV_RAW_TEXT',
                    rawContent: fileText.substring(0, 5000),
                    embedding: vector
                });
            } catch (e) {
                this.logger.error(`Failed to generate embedding for CV ${savedCv.id}: ${e.message}`);
            }

            if (parsedData.experiences) {
                const exps = parsedData.experiences.map((exp: any) =>
                    queryRunner.manager.create(CvExperience, {
                        ...exp,
                        cvId: savedCv.id,
                        companyName: exp.company_name || exp.companyName,
                        isCurrent: exp.is_current || exp.isCurrent || false,
                        startDate: exp.start_date || exp.startDate || null,
                        endDate: exp.end_date || exp.endDate || null
                    })
                );
                await queryRunner.manager.save(exps);
            }

            if (parsedData.educations) {
                const edus = parsedData.educations.map((edu: any) =>
                    queryRunner.manager.create(CvEducation, {
                        ...edu,
                        cvId: savedCv.id,
                        schoolName: edu.school_name || edu.schoolName,
                        startDate: edu.start_date || edu.startDate || null,
                        endDate: edu.end_date || edu.endDate || null
                    })
                );
                await queryRunner.manager.save(edus);
            }

            if (parsedData.skills) {
                const skills = parsedData.skills.map((skill: any) =>
                    queryRunner.manager.create(CvSkill, {
                        cvId: savedCv.id,
                        name: skill.skill_name || skill.name,
                        level: skill.level
                    })
                );
                await queryRunner.manager.save(skills);
            }

            if (parsedData.projects) {
                const projs = parsedData.projects.map((proj: any) =>
                    queryRunner.manager.create(CvProject, {
                        cvId: savedCv.id,
                        name: proj.name,
                        role: proj.role,
                        techStack: proj.tech_stack || proj.techStack,
                        url: proj.url
                    })
                );
                await queryRunner.manager.save(projs);
            }

            if (parsedData.certifications) {
                const certs = parsedData.certifications.map((cert: any) =>
                    queryRunner.manager.create(CvCertification, {
                        cvId: savedCv.id,
                        name: cert.name,
                        organization: cert.organization || null,
                        issueDate: cert.issue_date || cert.issueDate || null,
                        expiryDate: cert.expiry_date || cert.expiryDate || null,
                        credentialId: cert.credential_id || cert.credentialId || null,
                        credentialUrl: cert.credential_url || cert.credentialUrl || null
                    })
                );
                await queryRunner.manager.save(certs);
            }

            await queryRunner.commitTransaction();
            return savedCv;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async parsePdfWithoutSaving(file: Express.Multer.File) {
        let fileText = '';
        try {
            const data = await pdfParse(file.buffer);
            fileText = data.text;
        } catch (e) {
            this.logger.error(`Failed to extract text from PDF: ${e.message}`);
            throw new BadRequestException('Failed to read PDF file. Make sure it is not corrupted and contains selectable text.');
        }

        if (!fileText || fileText.trim().length === 0) {
            throw new BadRequestException('The uploaded PDF contains no text. Scanned documents or images are not supported.');
        }

        const parsedData = await this.promptService.parseCv(fileText);
        
        const fs = require('fs');
        const path = require('path');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(file.originalname);
        const filename = `cv-${uniqueSuffix}${fileExt}`;
        const uploadDir = path.join(process.cwd(), 'uploads');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        const fileUrl = `/upload/file/${filename}`;

        return {
            ...parsedData,
            cvTitle: file.originalname.replace(/\.[^/.]+$/, ""),
            fileUrl: fileUrl
        };
    }

    async triggerIndexing(id: string, fileText: string) {
        this.logger.log(`Re-indexing CV ${id}...`);
        const vector = await this.embeddingService.generateEmbedding(fileText);
        
        // 1. Update direct column
        await this.cvRepository.update(id, {
            cvVector: `[${vector.join(',')}]`
        } as any);

        // 2. ⭐ Also save to centralized vector_storage table
        await this.vectorSearchService.saveVector({
            refId: id,
            refType: 'CV',
            contentType: 'CV_REINDEX',
            rawContent: fileText.substring(0, 5000),
            embedding: vector
        });

        return { success: true };
    }
    async optimizeForJob(cvId: string, jobId: string) {
        const cv = await this.cvRepository.findOne({ 
            where: { id: cvId },
            relations: ['experiences', 'skills', 'projects', 'certifications']
        });
        if (!cv) throw new NotFoundException('CV not found');

        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Job not found');

        this.logger.log(`Optimizing CV ${cvId} for Job ${jobId}`);

        // Compile full CV text for AI
        const fullCvText = `
            Title: ${cv.cvTitle}
            Summary: ${cv.summary || ''}
            Skills: ${cv.skills?.map(s => s.name).join(', ') || ''}
            Experiences: ${cv.experiences?.map(e => `${e.position} at ${e.companyName}: ${e.description}`).join('\n') || ''}
            Projects: ${cv.projects?.map(p => `${p.name} (${p.role}): ${p.techStack}`).join('\n') || ''}
            Certifications: ${cv.certifications?.map(c => `${c.name} from ${c.organization}`).join('\n') || ''}
        `;

        // Gọi PromptService để lấy gợi ý từ Gemini
        return await this.promptService.optimizeCvForJob(job.description, fullCvText);
    }

    async findByCandidate(candidateId: string) {
        return await this.cvRepository.find({
            where: { candidateId },
            relations: ['experiences', 'educations', 'skills', 'projects', 'certifications'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: string) {
        const cv = await this.cvRepository.findOne({ where: { id }, relations: ['experiences', 'skills', 'educations', 'projects', 'certifications'] });
        if (!cv) throw new NotFoundException('CV not found');
        return cv;
    }

    async save(candidateId: string, data: any) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let cv;
            if (data.id) {
                cv = await queryRunner.manager.findOne(CandidateCv, { where: { id: data.id } });
                if (!cv) throw new NotFoundException('CV not found to update');

                // Update basic fields
                cv.cvTitle = data.cvTitle || cv.cvTitle;
                cv.summary = data.summary;
                cv.avatar = data.avatar;
                cv.fileUrl = data.fileUrl || cv.fileUrl;
                cv.isPrimary = data.isPrimary !== undefined ? data.isPrimary : cv.isPrimary;

                // Delete old relations to replace with new ones
                await queryRunner.manager.delete(CvExperience, { cvId: cv.id });
                await queryRunner.manager.delete(CvEducation, { cvId: cv.id });
                await queryRunner.manager.delete(CvSkill, { cvId: cv.id });
                await queryRunner.manager.delete(CvProject, { cvId: cv.id });
                await queryRunner.manager.delete(CvCertification, { cvId: cv.id });
            } else {
                cv = queryRunner.manager.create(CandidateCv, {
                    candidateId,
                    cvTitle: data.cvTitle || 'Untitled CV',
                    summary: data.summary,
                    isPrimary: data.isPrimary || false,
                    avatar: data.avatar,
                    fileUrl: data.fileUrl || null
                });
            }

            // Create a text context for vector embedding to enable AI Matching
            const contextText = `
                Title: ${data.cvTitle || ''}
                Summary: ${data.summary || ''}
                Experiences: ${data.experiences?.map((e: any) => `${e.position} at ${e.companyName}: ${e.description}`).join('. ') || ''}
                Projects: ${data.projects?.map((p: any) => `${p.name} (${p.role}): ${p.techStack}`).join('. ') || ''}
                Skills: ${data.skills?.map((s: any) => s.skillName).join(', ') || ''}
                Certifications: ${data.certifications?.map((c: any) => `${c.name} from ${c.organization}`).join(', ') || ''}
            `;
            // Generate embedding in background or try-catch to not block save
            let vectorString = null;
            let vectorArray = null;
            try {
                const vector = await this.embeddingService.generateEmbedding(contextText);
                vectorArray = vector;
                vectorString = `[${vector.join(',')}]`;
            } catch (e) {
                this.logger.error(`Failed to generate embedding during save: ${e.message}`);
            }

            (cv as any).cvVector = vectorString;

            const savedCv = await queryRunner.manager.save(cv);

            // ⭐ Also save to centralized vector_storage table if vector was generated
            if (vectorArray) {
                await this.vectorSearchService.saveVector({
                    refId: savedCv.id,
                    refType: 'CV',
                    contentType: 'CV_FORM_DATA',
                    rawContent: contextText.substring(0, 5000),
                    embedding: vectorArray
                });
            }

            if (data.experiences) {
                const exps = data.experiences.map((exp: any) =>
                    queryRunner.manager.create(CvExperience, {
                        cvId: savedCv.id,
                        companyName: exp.companyName,
                        position: exp.position,
                        startDate: exp.startDate || null,
                        endDate: exp.endDate || null,
                        isCurrent: exp.isPresent || false,
                        description: exp.description
                    })
                );
                await queryRunner.manager.save(exps);
            }

            if (data.educations) {
                const edus = data.educations.map((edu: any) =>
                    queryRunner.manager.create(CvEducation, {
                        cvId: savedCv.id,
                        schoolName: edu.schoolName,
                        degree: edu.degree,
                        major: edu.major,
                        endDate: edu.gradYear ? `${edu.gradYear}-12-31` : null
                    })
                );
                await queryRunner.manager.save(edus);
            }

            if (data.skills) {
                const skills = data.skills.map((skill: any) =>
                    queryRunner.manager.create(CvSkill, {
                        cvId: savedCv.id,
                        name: skill.skillName,
                        level: skill.level
                    })
                );
                await queryRunner.manager.save(skills);
            }

            if (data.projects) {
                const projs = data.projects.map((proj: any) =>
                    queryRunner.manager.create(CvProject, {
                        cvId: savedCv.id,
                        name: proj.name,
                        role: proj.role,
                        techStack: proj.techStack,
                        url: proj.url
                    })
                );
                await queryRunner.manager.save(projs);
            }

            if (data.certifications) {
                const certs = data.certifications.map((cert: any) =>
                    queryRunner.manager.create(CvCertification, {
                        cvId: savedCv.id,
                        name: cert.name,
                        organization: cert.organization || null,
                        issueDate: cert.issueDate || null,
                        expiryDate: cert.expiryDate || null,
                        credentialId: cert.credentialId || null,
                        credentialUrl: cert.credentialUrl || null
                    })
                );
                await queryRunner.manager.save(certs);
            }

            await queryRunner.commitTransaction();
            return savedCv;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getHistory(candidateId: string) {
        const cvs = await this.cvRepository.find({
            where: { candidateId },
            relations: ['experiences', 'skills', 'projects', 'educations', 'certifications'],
            order: { createdAt: 'DESC' }
        });

        const history = {
            summaries: [...new Set(cvs.map(c => c.summary).filter(s => s))],
            experiences: Array.from(new Set(cvs.flatMap(c => c.experiences || []).map(e => JSON.stringify({
                companyName: e.companyName,
                position: e.position,
                description: e.description
            })))).map(s => JSON.parse(s)),
            skills: Array.from(new Set(cvs.flatMap(c => c.skills || []).map(s => JSON.stringify({
                skillName: s.name,
                level: s.level
            })))).map(s => JSON.parse(s)),
            projects: Array.from(new Set(cvs.flatMap(c => c.projects || []).map(p => JSON.stringify({
                name: p.name,
                role: p.role,
                techStack: p.techStack
            })))).map(s => JSON.parse(s)),
            educations: Array.from(new Set(cvs.flatMap(c => c.educations || []).map(e => JSON.stringify({
                schoolName: e.schoolName,
                degree: e.degree,
                major: e.major
            })))).map(s => JSON.parse(s)),
            certifications: Array.from(new Set(cvs.flatMap(c => c.certifications || []).map(c => JSON.stringify({
                name: c.name,
                organization: c.organization
            })))).map(s => JSON.parse(s))
        };

        return history;
    }

    async delete(id: string) {
        const result = await this.cvRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException('CV not found');
        return { success: true };
    }
}
