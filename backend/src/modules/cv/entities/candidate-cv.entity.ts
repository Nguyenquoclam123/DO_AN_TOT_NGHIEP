import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CvExperience } from './cv-experience.entity';
import { CvEducation } from './cv-education.entity';
import { CvSkill } from './cv-skill.entity';
import { CvProject } from './cv-project.entity';
import { CvCertification } from './cv-certification.entity';

@Entity('candidate_cvs')
export class CandidateCv extends BaseEntity {
    @Column({ name: 'candidate_id', type: 'uuid' })
    candidateId: string;

    @Column({ name: 'cv_title' })
    cvTitle: string;

    @Column({ type: 'text', nullable: true })
    summary: string;

    @Column({ name: 'cv_vector', type: 'vector', dimension: 3072, nullable: true, select: false } as any)
    cvVector: string;

    @Column({ name: 'is_primary', default: false })
    isPrimary: boolean;

    @Column({ type: 'text', nullable: true })
    avatar: string;

    @Column({ name: 'file_url', type: 'character varying', nullable: true })
    fileUrl: string;

    @OneToMany(() => CvExperience, (exp) => exp.cv)
    experiences: CvExperience[];

    @OneToMany(() => CvEducation, (edu) => edu.cv)
    educations: CvEducation[];

    @OneToMany(() => CvSkill, (skill) => skill.cv)
    skills: CvSkill[];

    @OneToMany(() => CvProject, (project) => project.cv)
    projects: CvProject[];

    @OneToMany(() => CvCertification, (cert) => cert.cv)
    certifications: CvCertification[];
}
