import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('pipeline_steps')
export class PipelineStep extends BaseEntity {
    @Column({ name: 'step_name' })
    stepName: string;

    @Column({ name: 'order_number' })
    orderNumber: number;

    @Column({ name: 'company_id', nullable: true })
    companyId: string;

    @Column({ name: 'is_default', default: false })
    isDefault: boolean;
}
