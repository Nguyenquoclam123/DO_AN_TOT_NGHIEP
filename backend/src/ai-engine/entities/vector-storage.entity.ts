import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vector_storage')
export class VectorStorage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'ref_id' })
    refId: string;

    @Column({ name: 'ref_type' })
    refType: string;

    @Column({ name: 'content_type', nullable: true })
    contentType: string;

    @Column({ name: 'raw_content', type: 'text' })
    rawContent: string;

    @Column({ type: 'vector', dimension: 3072, nullable: true, select: false } as any)
    embedding: string;
}
