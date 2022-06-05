import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'fgs_authors' })
export class Author {
    @PrimaryGeneratedColumn({ name: 'au_id' })
    id: string;

    @Column({ name: 'au_name' })
    name: string;

    @Column({ name: 'au_email' })
    email: string;

    @Column({ name: 'au_notes' })
    description: string;

    modelCount?;
}
