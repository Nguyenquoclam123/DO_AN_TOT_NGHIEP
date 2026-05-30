import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CandidateCv } from './candidate-cv.entity';

@Entity('cv_skills')
export class CvSkill extends BaseEntity {
    @Column({ name: 'cv_id', type: 'uuid' })
    cvId: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    level: string;

    @ManyToOne(() => CandidateCv, (cv) => cv.skills, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cv_id' })
    cv: CandidateCv;
}
