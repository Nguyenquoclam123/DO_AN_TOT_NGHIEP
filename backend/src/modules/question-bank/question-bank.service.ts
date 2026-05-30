import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Question, QuestionOption, QuestionSet } from './entities/question.entity';

@Injectable()
export class QuestionBankService {
    constructor(
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(QuestionSet)
        private readonly questionSetRepository: Repository<QuestionSet>,
        private readonly dataSource: DataSource,
    ) { }

    // --- Question Set Methods ---
    async bootstrapCompany(companyId: string) {
        const startTime = Date.now();
        console.log(`[Bootstrap] Starting for company ${companyId}...`);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Fetch system templates using the manager to ensure consistency
            const systemSets = await queryRunner.manager.find(QuestionSet, {
                where: { companyId: IsNull() },
                relations: ['questions', 'questions.options'],
            });

            console.log(`[Bootstrap] Found ${systemSets.length} templates to clone.`);

            if (systemSets.length > 0) {
                // 2. Build the entity tree
                const newSets = systemSets.map(sysSet => {
                    return queryRunner.manager.create(QuestionSet, {
                        name: sysSet.name,
                        description: sysSet.description,
                        category: sysSet.category,
                        positionId: sysSet.positionId,
                        levelId: sysSet.levelId,
                        companyId: companyId,
                        originalId: sysSet.id, // Track the template it came from
                        questions: (sysSet.questions || []).map(q => queryRunner.manager.create(Question, {
                            content: q.content,
                            type: q.type,
                            difficulty: q.difficulty,
                            weight: q.weight,
                            order: q.order,
                            originalId: q.id, // Track original question
                            options: (q.options || []).map(opt => queryRunner.manager.create(QuestionOption, {
                                optionText: opt.optionText,
                                isCorrect: opt.isCorrect,
                                explanation: opt.explanation
                            }))
                        }))
                    });
                });

                // 3. Bulk save the entire tree
                await queryRunner.manager.save(QuestionSet, newSets);
            }

            await queryRunner.commitTransaction();
            const duration = Date.now() - startTime;
            console.log(`[Bootstrap] COMPLETED in ${duration}ms for company ${companyId}`);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`[Bootstrap] CRITICAL ERROR for company ${companyId}:`, error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createSet(data: any) {
        const sanitizedData = {
            ...data,
            positionId: data.positionId === '' ? null : data.positionId,
            levelId: data.levelId === '' ? null : data.levelId,
        };
        const set = this.questionSetRepository.create(sanitizedData);
        return await this.questionSetRepository.save(set);
    }

    async findSets(query: { companyId?: string, positionId?: string, levelId?: string, isAdmin?: boolean, minimal?: boolean }) {
        const { companyId, isAdmin, minimal, ...filters } = query;

        const qb = this.questionSetRepository.createQueryBuilder('set');

        if (!minimal) {
            qb.leftJoinAndSelect('set.position', 'position')
                .leftJoinAndSelect('set.level', 'level')
                .leftJoinAndSelect('set.questions', 'questions')
                .leftJoinAndSelect('set.company', 'company');
        }

        // Strict Partitioning Logic
        if (isAdmin) {
             // Admin sees templates (NULL) or specific company if requested
             if (companyId && companyId.trim() !== '') {
                 qb.andWhere('set.companyId = :companyId', { companyId });
             } else {
                 qb.andWhere('set.companyId IS NULL');
             }
        } else {
             // Employer/Company sees ONLY their own sets
             // We MUST have a companyId. If not, they see NOTHING (to prevent seeing Admin templates)
             if (companyId && companyId.trim() !== '') {
                 qb.andWhere('set.companyId = :companyId', { companyId });
             } else {
                 // Force a condition that returns nothing (e.g., companyId = 'impossible-id')
                 qb.andWhere('set.companyId = :impossible', { impossible: 'FORCE_EMPTY_RESULT' });
             }
        }

        if (filters.positionId) {
            qb.andWhere('set.positionId = :positionId', { positionId: filters.positionId });
        }
        if (filters.levelId) {
            qb.andWhere('set.levelId = :levelId', { levelId: filters.levelId });
        }

        qb.andWhere('set.category != :snapshotCategory', { snapshotCategory: 'JOB_SNAPSHOT' });

        qb.orderBy('set.createdAt', 'DESC');
        if (!minimal) {
            qb.addOrderBy('questions.order', 'ASC');
        }

        const allSets = await qb.getMany();



        return allSets;
    }

    async findSetOne(id: string) {
        const set = await this.questionSetRepository.findOne({
            where: { id },
            relations: ['position', 'level', 'questions', 'questions.options'],
            order: { questions: { order: 'ASC' } }
        });
        if (!set) throw new NotFoundException('Question set not found');
        return set;
    }

    private async validateOwnership(setId: string, companyId: string, manager: any, userRole?: string): Promise<string> {
        if (userRole === 'ADMIN') return setId;

        if (!companyId) {
            throw new Error('Company ID is required for non-admin modifications');
        }

        const existingSet = await manager.findOne(QuestionSet, {
            where: { id: setId }
        });

        if (!existingSet) throw new NotFoundException('Question set not found');

        if (existingSet.companyId !== companyId) {
            throw new Error('Unauthorized access to this question set');
        }

        return setId;
    }

    async addQuestionToSet(setId: string, dto: any, companyId?: string, userRole?: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const targetSetId = await this.validateOwnership(setId, companyId, queryRunner.manager, userRole);

            const question = queryRunner.manager.create(Question, {
                content: dto.content,
                type: dto.type,
                difficulty: dto.difficulty || 'MEDIUM',
                weight: dto.weight || 1.0,
                questionSetId: targetSetId
            });
            const savedQuestion = await queryRunner.manager.save(Question, question);

            if (dto.options && dto.options.length > 0) {
                const options = dto.options.map(opt =>
                    queryRunner.manager.create(QuestionOption, {
                        ...opt,
                        questionId: savedQuestion.id
                    })
                );
                await queryRunner.manager.save(QuestionOption, options);
            }

            await queryRunner.commitTransaction();
            return { ...savedQuestion, questionSetId: targetSetId };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async bulkAddQuestions(setId: string, questions: any[], companyId?: string, userRole?: string) {
        let currentSetId = setId;
        for (const q of questions) {
            const result = await this.addQuestionToSet(currentSetId, q, companyId, userRole);
            currentSetId = result.questionSetId;
        }
        return this.findSetOne(currentSetId);
    }

    async getSummary(companyId: string) {
        // Fetch all sets with deduplication logic applied
        const allSets = await this.findSets({
            companyId,
            isAdmin: false,
            minimal: true
        });

        const summaryMap = new Map<string, number>();

        for (const set of allSets) {
            const pId = set.positionId || 'null';
            const lId = set.levelId || 'null';
            const key = `${pId}_${lId}`;
            summaryMap.set(key, (summaryMap.get(key) || 0) + 1);
        }

        const results = [];
        summaryMap.forEach((count, key) => {
            const [pId, lId] = key.split('_');
            results.push({
                positionId: pId === 'null' ? null : pId,
                levelId: lId === 'null' ? null : lId,
                setCount: count
            });
        });

        return results;
    }

    async updateSet(id: string, dto: any) {
        const set = await this.questionSetRepository.preload({
            id,
            ...dto
        });
        if (!set) throw new NotFoundException('Question set not found');
        return await this.questionSetRepository.save(set);
    }

    async deleteSet(id: string, companyId?: string, userRole?: string) {
        const set = await this.questionSetRepository.findOne({ 
            where: { id },
            relations: ['questions'] 
        });
        if (!set) throw new NotFoundException('Question set not found');

        // Security check
        if (userRole !== 'ADMIN') {
            if (set.companyId === null) {
                throw new Error('Cannot delete system question sets');
            }
            if (set.companyId !== companyId) {
                throw new Error('Unauthorized to delete this question set');
            }
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Unlink from jobs (Cleanup many-to-many join table)
            await queryRunner.query(`DELETE FROM job_question_sets WHERE question_set_id = $1`, [id]);

            // 2. Handle candidate answers (SET NULL manually if DB hasn't picked up the change yet)
            const questionIds = set.questions?.map(q => q.id) || [];
            if (questionIds.length > 0) {
                await queryRunner.query(`UPDATE app_answers SET question_id = NULL WHERE question_id = ANY($1)`, [questionIds]);
            }

            // 3. Delete the set (Cascades to questions and options)
            await queryRunner.manager.remove(QuestionSet, set);

            await queryRunner.commitTransaction();
            return { success: true };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateQuestion(id: string, dto: any, companyId?: string, userRole?: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const originalQuestion = await queryRunner.manager.findOne(Question, {
                where: { id },
                relations: ['options', 'questionSet']
            });
            if (!originalQuestion) throw new NotFoundException('Question not found');

            const targetSetId = await this.validateOwnership(originalQuestion.questionSetId, companyId, queryRunner.manager, userRole);

            let questionToUpdate;
            if (targetSetId !== originalQuestion.questionSetId) {
                // We just cloned the set (or found an existing clone).
                // Find the version of the question in the new set using originalId.
                questionToUpdate = await queryRunner.manager.findOne(Question, {
                    where: {
                        questionSetId: targetSetId,
                        originalId: originalQuestion.id
                    }
                });

                // Fallback: If originalId lookup fails, try content and order (for legacy data)
                if (!questionToUpdate) {
                    questionToUpdate = await queryRunner.manager.findOne(Question, {
                        where: {
                            questionSetId: targetSetId,
                            content: originalQuestion.content,
                            order: originalQuestion.order
                        }
                    });
                }
            } else {
                questionToUpdate = originalQuestion;
            }

            if (!questionToUpdate) throw new NotFoundException('Question variant not found in target set');

            if (dto.content) questionToUpdate.content = dto.content;
            if (dto.type) questionToUpdate.type = dto.type;
            if (dto.difficulty) questionToUpdate.difficulty = dto.difficulty;
            if (dto.weight !== undefined) questionToUpdate.weight = dto.weight;

            await queryRunner.manager.save(Question, questionToUpdate);

            if (dto.options) {
                await queryRunner.manager.delete(QuestionOption, { questionId: questionToUpdate.id });
                const options = dto.options.map(opt =>
                    queryRunner.manager.create(QuestionOption, {
                        ...opt,
                        questionId: questionToUpdate.id
                    })
                );
                await queryRunner.manager.save(QuestionOption, options);
            }

            await queryRunner.commitTransaction();
            return { set: await this.findSetOne(targetSetId), newSetId: targetSetId !== originalQuestion.questionSetId ? targetSetId : null };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteQuestion(id: string, companyId?: string, userRole?: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const originalQuestion = await queryRunner.manager.findOne(Question, { where: { id } });
            if (!originalQuestion) throw new NotFoundException('Question not found');

            const targetSetId = await this.validateOwnership(originalQuestion.questionSetId, companyId, queryRunner.manager, userRole);

            if (targetSetId !== originalQuestion.questionSetId) {
                // If cloned, find the version in the new set and delete it
                let questionToDelete = await queryRunner.manager.findOne(Question, {
                    where: {
                        questionSetId: targetSetId,
                        originalId: originalQuestion.id
                    }
                });

                // Fallback for legacy data
                if (!questionToDelete) {
                    questionToDelete = await queryRunner.manager.findOne(Question, {
                        where: {
                            questionSetId: targetSetId,
                            content: originalQuestion.content,
                            order: originalQuestion.order
                        }
                    });
                }
                
                if (questionToDelete) await queryRunner.manager.remove(Question, questionToDelete);
            } else {
                await queryRunner.manager.remove(Question, originalQuestion);
            }

            await queryRunner.commitTransaction();
            return { success: true, setId: targetSetId, isNewSet: targetSetId !== originalQuestion.questionSetId };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async reorderQuestions(setId: string, questionIds: string[], companyId?: string, userRole?: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const targetSetId = await this.validateOwnership(setId, companyId, queryRunner.manager, userRole);

            for (let i = 0; i < questionIds.length; i++) {
                await queryRunner.manager.update(Question, questionIds[i], { order: i });
            }
            await queryRunner.commitTransaction();
            return { set: await this.findSetOne(targetSetId), newSetId: targetSetId !== setId ? targetSetId : null };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async cleanDuplicates(companyId: string) {
        const sets = await this.questionSetRepository.find({
            where: { companyId },
            order: { createdAt: 'DESC' }
        });

        const seen = new Set();
        const toDelete = [];

        for (const set of sets) {
            const pKey = set.positionId || 'global';
            const lKey = set.levelId || 'global';
            const nameKey = (set.name || '').toLowerCase().trim();
            const key = `${pKey}-${lKey}-${nameKey}`;

            if (seen.has(key)) {
                toDelete.push(set.id);
            } else {
                seen.add(key);
            }
        }

        if (toDelete.length > 0) {
            await this.questionSetRepository.delete(toDelete);
        }
        return { deletedCount: toDelete.length };
    }

    async cloneSetForJob(setId: string): Promise<string> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const sourceSet = await queryRunner.manager.findOne(QuestionSet, {
                where: { id: setId },
                relations: ['questions', 'questions.options']
            });

            if (!sourceSet) throw new NotFoundException('Source question set not found');

            // 1. Create Cloned Set
            const newSet = queryRunner.manager.create(QuestionSet, {
                name: sourceSet.name,
                description: sourceSet.description,
                category: 'JOB_SNAPSHOT', // Mark as snapshot
                positionId: sourceSet.positionId,
                levelId: sourceSet.levelId,
                companyId: sourceSet.companyId
            });
            const savedSet = await queryRunner.manager.save(QuestionSet, newSet);

            // 2. Clone Questions
            if (sourceSet.questions && sourceSet.questions.length > 0) {
                for (const q of sourceSet.questions) {
                    const newQ = queryRunner.manager.create(Question, {
                        content: q.content,
                        type: q.type,
                        difficulty: q.difficulty,
                        weight: q.weight,
                        order: q.order,
                        questionSetId: savedSet.id,
                        originalId: q.id // Track origin
                    });
                    const savedQ = await queryRunner.manager.save(Question, newQ);

                    // 3. Clone Options
                    if (q.options && q.options.length > 0) {
                        const newOptions = q.options.map(opt => queryRunner.manager.create(QuestionOption, {
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect,
                            explanation: opt.explanation,
                            questionId: savedQ.id
                        }));
                        await queryRunner.manager.save(QuestionOption, newOptions);
                    }
                }
            }

            await queryRunner.commitTransaction();
            return savedSet.id;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
