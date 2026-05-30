import { Entity, Column, OneToMany, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JobPosition } from '../../master-data/entities/position.entity';
import { JobLevel } from '../../master-data/entities/level.entity';
import { Company } from '../../company/entities/company.entity';

@Entity('question_sets')
export class QuestionSet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'company_id', type: 'uuid', nullable: true })
    companyId: string;

    @Column({ name: 'position_id', type: 'uuid', nullable: true })
    positionId: string;

    @Column({ name: 'level_id', type: 'uuid', nullable: true })
    levelId: string;

    @Column({ nullable: true })
    category: string; 

    @Column({ name: 'original_id', type: 'uuid', nullable: true })
    originalId: string;
    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @ManyToOne(() => JobPosition)
    @JoinColumn({ name: 'position_id' })
    position: JobPosition;

    @ManyToOne(() => JobLevel)
    @JoinColumn({ name: 'level_id' })
    level: JobLevel;

    @OneToMany(() => Question, (question) => question.questionSet, { cascade: true })
    questions: Question[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: 'MULTIPLE_CHOICE' })
    type: string; 

    @Column({ default: 'MEDIUM' })
    difficulty: string; 

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
    weight: number;

    @Column({ default: 0 })
    order: number;

    @Column({ name: 'question_set_id', type: 'uuid' })
    questionSetId: string;

    @Column({ name: 'original_id', type: 'uuid', nullable: true })
    originalId: string;

    @ManyToOne(() => QuestionSet, (set) => set.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_set_id' })
    questionSet: QuestionSet;

    @OneToMany(() => QuestionOption, (option) => option.question, { cascade: true })
    options: QuestionOption[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('question_options')
export class QuestionOption {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @Column({ name: 'option_text' })
    optionText: string;

    @Column({ name: 'is_correct', default: false })
    isCorrect: boolean;

    @Column({ nullable: true })
    explanation: string;

    @ManyToOne(() => Question, (question) => question.options, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question: Question;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
