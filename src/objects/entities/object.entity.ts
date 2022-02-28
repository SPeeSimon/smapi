import { Point } from 'geojson';
import { Author } from 'src/authors/entities/author.entity';
import { ObjectGroup } from 'src/modelgroups/entities/group.entity';
import { Model } from 'src/models/entities/model.entity';
import { Country } from 'src/navaids/entities/country.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'fgs_objects' })
export class FGSObject {
    @PrimaryGeneratedColumn({ name: 'ob_id' })
    id: number;

    @UpdateDateColumn({ name: 'ob_modified' })
    modified: Date;

    @Column({ name: 'ob_deleted' })
    deleted?: Date;

    @Column({ name: 'ob_text' })
    description: string;

    @Column({ name: 'wkb_geometry', type: 'geometry', srid: 4326 })
    geometry: Point;

    @Column({ name: 'ob_gndelev', default: -9999 })
    gndelev: number;

    @Column({ name: 'ob_elevoffset' })
    elevoffset: number;

    @Column({ name: 'ob_peakelev' })
    peakelev: number;

    @Column({ name: 'ob_heading' })
    heading: number;

    @JoinColumn({ name: 'ob_country' })
    @ManyToOne(() => Country, (country) => country.code)
    country: Country;

    @JoinColumn({ name: 'ob_model' })
    @ManyToOne(() => Model, (model) => model.id)
    model: Model;

    @JoinColumn({ name: 'ob_group' })
    @ManyToOne(() => ObjectGroup, (group) => group.id)
    group: ObjectGroup;

    @Column({ name: 'ob_tile' })
    tile: number;

    @Column({ name: 'ob_reference' })
    reference: string;

    @Column({ name: 'ob_submitter' })
    submitter: string;

    @Column({ name: 'ob_valid' })
    valid: boolean;

    @Column({ name: 'ob_class' })
    class: string;

    @JoinColumn({ name: 'ob_modified_by' })
    @ManyToOne(() => Author, (author) => author.id)
    modified_by: Author;
}

/*
    ob_id integer NOT NULL DEFAULT nextval('fgs_objects_ob_id_seq'::regclass),
    ob_modified timestamp without time zone,
    ob_deleted timestamp without time zone NOT NULL DEFAULT '1970-01-01 00:00:01'::timestamp without time zone,
    ob_text character varying(100) COLLATE pg_catalog."default",
    wkb_geometry geometry(Point,4326) NOT NULL,
    ob_gndelev numeric(7,2) DEFAULT '-9999'::integer,
    ob_elevoffset numeric(5,2) DEFAULT NULL::numeric,
    ob_peakelev numeric(7,2),
    ob_heading numeric(5,2) DEFAULT 0,
    ob_country character(2) COLLATE pg_catalog."default" DEFAULT NULL::bpchar,
    ob_model integer,
    ob_group integer,
    ob_tile integer,
    ob_reference character varying(20) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    ob_submitter character varying(16) COLLATE pg_catalog."default" DEFAULT 'unknown'::character varying,
    ob_valid boolean DEFAULT true,
    ob_class character varying(10) COLLATE pg_catalog."default",
    ob_modified_by integer,
    CONSTRAINT fgs_objects_pkey PRIMARY KEY (ob_id),
    CONSTRAINT enforce_dims_wkb_geometry CHECK (st_ndims(wkb_geometry) = 2),
    CONSTRAINT enforce_geotype_wkb_geometry CHECK (geometrytype(wkb_geometry) = 'POINT'::text),
    CONSTRAINT enforce_srid_wkb_geometry CHECK (st_srid(wkb_geometry) = 4326),
    CONSTRAINT enforce_valid_wkb_geometry CHECK (st_isvalid(wkb_geometry))
*/
