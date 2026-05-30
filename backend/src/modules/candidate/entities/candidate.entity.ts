import { Entity, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Application } from '../../application/entities/application.entity';
import { User } from '../../user/entities/user.entity';

@Entity('candidates')
export class Candidate extends BaseEntity {
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'jsonb', nullable: true, name: 'notification_preferences' })
  notificationPreferences: {
    jobRecommendations: boolean;
    applicationStatus: boolean;
    nexusAiTips: boolean;
    marketingPromo: boolean;
  };

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Application, (application) => application.candidate)
  applications: Application[];
}
