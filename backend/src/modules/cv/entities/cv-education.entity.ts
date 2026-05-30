import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CandidateCv } from './candidate-cv.entity';

@Entity('cv_educations')
export class CvEducation extends BaseEntity {
    @Column({ name: 'cv_id', type: 'uuid' })
    cvId: string;

    @Column({ name: 'school_name' })
    schoolName: string;

    @Column({ nullable: true })
    major: string;

    @Column({ nullable: true })
    degree: string;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    gpa: number;

    @ManyToOne(() => CandidateCv, (cv) => cv.educations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cv_id' })
    cv: CandidateCv;
}
