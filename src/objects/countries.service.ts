import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country, UNKNOWN_COUNTRY } from 'src/dao/entities/country.entity';

@Injectable()
export class CountriesService {
    constructor(@InjectRepository(Country) private countryRepository: Repository<Country>) {}

    findOne(countryCode: string) {
        return this.countryRepository.findOneOrFail({ code: countryCode });
    }

    getCountryAt(long: number, lat: number): Promise<Country[]> {
        return this.countryRepository
            .createQueryBuilder()
            .select('country')
            .from(Country, 'country')
            .innerJoin('gadm2', 'gadm2', 'gadm2.iso ILIKE fgs_countries.co_three')
            .where('ST_Within(ST_PointFromText($1, 4326), gadm2.wkb_geometry)', [`POINT(${long} ${lat})`])
            .getMany()
            .then((result) => {
                return result.length == 0 ? [UNKNOWN_COUNTRY] : [...result];  // If not found, return Unknown
            });
    }

    findAll() {
        return this.countryRepository.find({ order: { name: 'ASC' } });
    }
}
