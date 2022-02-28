import { Column, Entity, PrimaryColumn } from 'typeorm';

export const UNKNOWN_COUNTRY = { code: 'zz', name: 'Unknown' } as Country;

@Entity({ name: 'fgs_countries' })
export class Country {
    @PrimaryColumn({ name: 'co_code', length: 2 })
    code: string;

    @Column({ name: 'co_name', length: 50 })
    name: string;

    @Column({ name: 'co_three', length: 3 })
    three: string;
}

/*
CREATE TABLE IF NOT EXISTS public.fgs_countries
(
    co_code character(2) COLLATE pg_catalog."default" NOT NULL,
    co_name character(50) COLLATE pg_catalog."default",
    co_three character(3) COLLATE pg_catalog."default",
*/
