import { Column, Entity, TableInheritance, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'fgs_authors' })
// @ViewEntity({ name: 'fgs_authors' })
export class Author {
    @PrimaryGeneratedColumn({ name: 'au_id' })
    id: string;

    @Column({ name: 'au_name' })
    name: string;

    @Column({ name: 'au_email' })
    email: string;

    @Column({ name: 'au_notes' })
    description: string;
}
/*
    au_id integer NOT NULL DEFAULT nextval('fgs_authors_au_id_seq'::regclass),
    au_name character varying(40) COLLATE pg_catalog."default",
    au_email character varying(40) COLLATE pg_catalog."default",
    au_notes character varying COLLATE pg_catalog."default",
    au_modeldir character(3) COLLATE pg_catalog."default",
    name character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    modeldir character varying(255) COLLATE pg_catalog."default",

                    INNER JOIN fgs_extuserids ON au_id=eu_author_id \
                    WHERE eu_authority=$1 AND eu_external_id=$2",

*/
