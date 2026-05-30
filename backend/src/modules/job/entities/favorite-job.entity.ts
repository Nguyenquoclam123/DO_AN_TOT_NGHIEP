import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Job } from './job.entity';
import { FavoriteCategory } from './favorite-category.entity';

@Entity('favorite_jobs')
@Unique(['userId', 'jobId'])
export class FavoriteJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'job_id', type: 'uuid' })
    jobId: string;

    @Column({ name: 'category_id', type: 'uuid', nullable: true })
    categoryId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Job)
    @JoinColumn({ name: 'job_id' })
    job: Job;

    @ManyToOne(() => FavoriteCategory, (category) => category.favoriteJobs, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'category_id' })
    category: FavoriteCategory;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
