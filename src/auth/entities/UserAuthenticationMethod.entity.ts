import { Column, JoinColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User.entity';


@Entity({ name: 'fgs_extuserids' })
export class UserAuthenticationMethod {
    @PrimaryColumn({ name: 'eu_external_id' })
    external_id: number;
    @Column({ name: 'eu_authority' })
    authority: number;
    @Column({ name: 'eu_lastlogin' })
    lastlogin: Date;
    @Column({ name: 'eu_author_id'})
    // @JoinColumn({ name: 'eu_author_id'})
    // @ManyToOne(() => User, (user) => user.id)
    author: number;
}
