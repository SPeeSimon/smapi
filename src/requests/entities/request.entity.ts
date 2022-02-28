import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'fgs_position_requests' })
export class PositionRequest {
    @PrimaryGeneratedColumn({ name: 'spr_id' })
    id: number;
    @Column({ name: 'spr_hash' })
    hash: string;
    @Column({ name: 'spr_base64_sqlz' })
    base64_sqlz: string;
    @Column({ name: 'positionrequest' })
    positionrequest: string;
}
/*
CREATE TABLE IF NOT EXISTS public.fgs_position_requests
(
    spr_id integer NOT NULL DEFAULT nextval('fgs_position_requests_spr_id_seq'::regclass),
    spr_hash character varying COLLATE pg_catalog."default",
    spr_base64_sqlz character varying COLLATE pg_catalog."default",
    positionrequest character varying(255) COLLATE pg_catalog."default",
    created_by integer,
    updated_by integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
*/
