import { IsEmail, MaxLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Author (for models and news)
 */
@Entity({ name: 'fgs_authors' })
export class Author {
    @PrimaryGeneratedColumn({ name: 'au_id' })
    id: string;

    @Column({ name: 'au_name' })
    name: string;

    @IsEmail()
    @MaxLength(50)
    @Column({ name: 'au_email' })
    email: string;

    @Column({ name: 'au_notes' })
    description: string;

    modelCount?: number;
}
