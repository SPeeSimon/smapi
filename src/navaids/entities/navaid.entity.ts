import { Point } from 'geojson';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// fgs_navtype
enum NavType {
    NDB,
    VOR,
    LOC,
    'LOC-ILS',
    GS,
    OM,
    MM,
    IM,
    'DME-ILS',
    DME,
}

@Entity({ name: 'fgs_navaids' })
export class Navaid {
    @PrimaryGeneratedColumn({ name: 'na_id' })
    id: number;

    @Column({ name: 'na_type', type: 'enum', enum: NavType })
    type: NavType;

    @Column({ name: 'na_position', type: 'geometry', srid: 4326 })
    position: Point;

    @Column({ name: 'na_elevation' })
    elevation: number;

    @Column({ name: 'na_frequency' })
    frequency: number;

    @Column({ name: 'na_range' })
    range: number;

    @Column({ name: 'na_multiuse' })
    multiuse: number;

    @Column({ name: 'na_ident' })
    ident: string;

    @Column({ name: 'na_name' })
    name: string;

    @Column({ name: 'na_airport_id' })
    airport_id: string;

    @Column({ name: 'na_runway' })
    runway: string;
}


/*
CREATE TABLE IF NOT EXISTS public.fgs_navaids
(
    na_id integer NOT NULL DEFAULT nextval('fgs_navaids_na_id_seq'::regclass),
    na_type fgs_navtype,
    na_position geometry(Point,4326),
    na_elevation numeric,
    na_frequency integer,
    na_range numeric,
    na_multiuse numeric,
    na_ident text COLLATE pg_catalog."default",
    na_name text COLLATE pg_catalog."default",
    na_airport_id text COLLATE pg_catalog."default",
    na_runway text COLLATE pg_catalog."default",
*/