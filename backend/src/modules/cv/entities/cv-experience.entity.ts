import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CandidateCv } from './candidate-cv.entity';

@Entity('cv_experiences')
export class CvExperience extends BaseEntity {
    @Column({ name: 'cv_id', type: 'uuid' })
    cvId: string;

    @Column({ name: 'company_name' })
    companyName: string;

    @Column()
    position: string;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({ name: 'is_current', default: false })
    isCurrent: boolean;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => CandidateCv, (cv) => cv.experiences, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cv_id' })
    cv: CandidateCv;
}
