import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'fgs_position_requests' })
export class PositionRequest {
    @PrimaryGeneratedColumn({ name: 'spr_id' })
    id: number;
    @Column({ name: 'spr_hash' })
    hash: string;
    @Column({ name: 'spr_base64_sqlz' })
    base64_sqlz: string;
}
