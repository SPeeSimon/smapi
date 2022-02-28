import { Geometry } from 'geojson';
import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'fgs_signs' })
export class Sign {
    @PrimaryGeneratedColumn({ name: 'si_id' })
    id: number;

    @UpdateDateColumn({ name: 'si_modified' })
    modified: Date;

    @Column({ name: 'si_text' })
    text: string;

    @Column({ name: 'wkb_geometry', type: 'geometry', srid: 4326 })
    geometry: Geometry;

    @Column({ name: 'si_icao' })
    icao: string;

    @Column({ name: 'si_gndelev' })
    gndelev: number; // numeric(7,2) DEFAULT '-9999.00'::numeric,

    @Column({ name: 'si_heading' })
    heading: number; // numeric(5,2) DEFAULT 0.00,

    @Column({ name: 'si_country' })
    country: string; // character(2) COLLATE pg_catalog."default",

    @Column({ name: 'si_definition' })
    definition: string; // character varying(60) COLLATE pg_catalog."default",

    @Column({ name: 'si_tile' })
    tile: number;

    @Column({ name: 'si_submitter' })
    submitter: string;

    @Column({ name: 'si_valid' })
    valid: boolean;
}

/*
CREATE TABLE IF NOT EXISTS public.fgs_signs
(
    si_id integer NOT NULL DEFAULT nextval('fgs_signs_si_id_seq'::regclass),
    si_modified timestamp without time zone,
    si_text character varying(100) COLLATE pg_catalog."default",
    wkb_geometry geometry NOT NULL,
    si_icao character(4) COLLATE pg_catalog."default" NOT NULL,
    si_gndelev numeric(7,2) DEFAULT '-9999.00'::numeric,
    si_heading numeric(5,2) DEFAULT 0.00,
    si_country character(2) COLLATE pg_catalog."default",
    si_definition character varying(60) COLLATE pg_catalog."default",
    si_tile integer,
    si_submitter character varying(16) COLLATE pg_catalog."default",
    si_valid boolean DEFAULT true,
    CONSTRAINT fgs_signs_pkey PRIMARY KEY (si_id),
    CONSTRAINT enforce_dims_wkb_geometry CHECK (st_ndims(wkb_geometry) = 2),
    CONSTRAINT enforce_geotype_wkb_geometry CHECK (geometrytype(wkb_geometry) = 'POINT'::text),
    CONSTRAINT enforce_srid_wkb_geometry CHECK (st_srid(wkb_geometry) = 4326)

*/
