import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'fgs_statistics' })
export class Statistics {
    @PrimaryColumn({ name: 'st_date' })
    st_date: Date;

    @Column({ name: 'st_objects' })
    st_objects: number;

    @Column({ name: 'st_models' })
    st_models: number;

    @Column({ name: 'st_authors' })
    st_authors: number;

    @Column({ name: 'st_navaids' })
    st_navaids: number;

    @Column({ name: 'st_signs' })
    st_signs: number;
}

/*
CREATE TABLE public.fgs_statistics (
    st_date date,
    st_objects bigint,
    st_models bigint,
    st_authors bigint,
    st_navaids bigint,
    st_signs bigint
);
*/