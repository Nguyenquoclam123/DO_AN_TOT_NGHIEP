import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { FavoriteJob } from './favorite-job.entity';

@Entity('favorite_categories')
export class FavoriteCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => FavoriteJob, (favoriteJob) => favoriteJob.category)
    favoriteJobs: FavoriteJob[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
