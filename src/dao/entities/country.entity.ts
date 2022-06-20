import { Column, Entity, PrimaryColumn } from 'typeorm';

export const UNKNOWN_COUNTRY = { code: 'zz', name: 'Unknown' } as Country;

/**
 * Country class
 */
@Entity({ name: 'fgs_countries' })
export class Country {
    @PrimaryColumn({ name: 'co_code', length: 2 })
    code: string;

    @Column({ name: 'co_name', length: 50 })
    name: string;

    @Column({ name: 'co_three', length: 3 })
    codeThree: string;
}
