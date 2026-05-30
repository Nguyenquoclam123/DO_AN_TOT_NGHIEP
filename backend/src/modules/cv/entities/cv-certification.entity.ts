import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CandidateCv } from './candidate-cv.entity';

@Entity('cv_certifications')
export class CvCertification extends BaseEntity {
    @Column({ name: 'cv_id', type: 'uuid' })
    cvId: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    organization: string;

    @Column({ name: 'issue_date', type: 'date', nullable: true })
    issueDate: Date;

    @Column({ name: 'expiry_date', type: 'date', nullable: true })
    expiryDate: Date;

    @Column({ name: 'credential_id', nullable: true })
    credentialId: string;

    @Column({ name: 'credential_url', nullable: true })
    credentialUrl: string;

    @ManyToOne(() => CandidateCv, (cv) => cv.certifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cv_id' })
    cv: CandidateCv;
}
