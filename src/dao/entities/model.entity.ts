import { MinLength } from 'class-validator';
import { Author } from 'src/dao/entities/author.entity';
import { Modelgroup } from 'src/dao/entities/modelgroup.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * 
 */
@Entity({ name: 'fgs_models' })
export class Model {
    @PrimaryGeneratedColumn({ name: 'mo_id' })
    id: number;

    @UpdateDateColumn({ name: 'mo_modified' })
    lastUpdated: Date;

    @JoinColumn({ name: 'mo_modified_by' })
    @ManyToOne(() => Author, (author) => author.id)
    modified_by: Author;

    @Column({ name: 'mo_path' })
    path: string;

    @MinLength(1)
    @Column({ name: 'mo_name' })
    name: string;

    @JoinColumn({ name: 'mo_author' })
    @ManyToOne(() => Author, (author) => author.id)
    author: Author;

    @Column({ name: 'mo_notes' })
    description: string;

    @Column({ name: 'mo_thumbfile', select: false })
    thumbfile: string;

    @Column({ name: 'mo_modelfile', select: false })
    modelfile: string;

    @JoinColumn({ name: 'mo_shared' })
    @ManyToOne(() => Modelgroup, (mg) => mg.id)
    modelgroup: Modelgroup;
}

/*
    mo_id integer NOT NULL DEFAULT nextval('fgs_models_mo_id_seq'::regclass),
    mo_path character varying(100) COLLATE pg_catalog."default" NOT NULL,
    mo_modified timestamp without time zone,
    mo_author integer,
    mo_name character varying(100) COLLATE pg_catalog."default",
    mo_notes text COLLATE pg_catalog."default",
    mo_thumbfile text COLLATE pg_catalog."default",
    mo_modelfile text COLLATE pg_catalog."default",
    mo_shared integer,
    mo_modified_by integer,

select mo_id,mo_path,mo_modified,mo_author,mo_name,mo_notes,mo_modelfile,mo_shared,mg_id,mg_name,au_id,au_name \
                FROM fgs_models \
                LEFT JOIN fgs_modelgroups on fgs_models.mo_shared = fgs_modelgroups.mg_id \
                LEFT JOIN fgs_authors on mo_author=au_id \
                where mo_id = $1",
*/
