import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'fgs_groups' })
export class ObjectGroup {
    @PrimaryGeneratedColumn({ name: 'gp_id' })
    id: number;
    @Column({ name: 'gp_name' })
    name: string;
}
