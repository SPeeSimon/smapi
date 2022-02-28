import { ApiProperty } from '@nestjs/swagger';
import { Author } from '../../authors/entities/author.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'fgs_news' })
export class News {
    @ApiProperty({
        description: 'The id of the news post',
    })
    @PrimaryGeneratedColumn('increment', { name: 'ne_id' })
    id: number;

    @ApiProperty({
        description: 'The create date of the news post',
        minimum: 1,
        default: 1,
    })
    @CreateDateColumn({ name: 'ne_timestamp' })
    timestamp: Date;

    @ApiProperty({
        description: 'The creator of the news post',
        minimum: 1,
    })
    @JoinColumn({ name: 'ne_author' })
    @ManyToOne(() => Author, (author) => author.id)
    author: Author;

    @ApiProperty({
        description: 'The news post content',
        minimum: 1,
    })
    @Column({ name: 'ne_text' })
    text: string;
}

/*
    ne_id integer NOT NULL DEFAULT nextval('fgs_news_ne_id_seq'::regclass),
    ne_timestamp timestamp without time zone NOT NULL,
    ne_author integer NOT NULL DEFAULT 0,
    ne_text text COLLATE pg_catalog."default",
*/