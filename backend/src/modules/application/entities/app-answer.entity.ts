import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Application } from './application.entity';
import { Question } from '../../question-bank/entities/question.entity';

@Entity('app_answers')
export class AppAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid', nullable: true })
  applicationId: string;

  @Column({ name: 'question_id', type: 'uuid', nullable: true })
  questionId: string;

  @Column({ name: 'selected_option_id', nullable: true })
  selectedOptionId: string;

  @Column({ name: 'selected_option_ids', type: 'simple-array', nullable: true })
  selectedOptionIds: string[];

  @Column({ name: 'text_answer', type: 'text', nullable: true })
  textAnswer: string;

  @ManyToOne(() => Application, (app) => app.answers)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @ManyToOne(() => Question, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
