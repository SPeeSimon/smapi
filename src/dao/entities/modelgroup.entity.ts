import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Contains information about a group of models
 */
@Entity({ name: 'fgs_modelgroups' })
export class Modelgroup {
    @PrimaryGeneratedColumn({ name: 'mg_id' })
    id: string;
    @Column({ name: 'mg_name' })
    name: string;
    @Column({ name: 'mg_path' })
    path: string;
}
