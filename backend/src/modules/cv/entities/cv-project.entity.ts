import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CandidateCv } from './candidate-cv.entity';

@Entity('cv_projects')
export class CvProject extends BaseEntity {
    @Column({ name: 'cv_id', type: 'uuid' })
    cvId: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    role: string;

    @Column({ name: 'tech_stack', type: 'text', nullable: true })
    techStack: string;

    @Column({ nullable: true })
    url: string;

    @ManyToOne(() => CandidateCv, (cv) => cv.projects, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cv_id' })
    cv: CandidateCv;
}
