import { Injectable } from '@nestjs/common';
import { Paging } from 'src/shared/dto/Paging.dto';
import { getConnection } from 'typeorm';

@Injectable()
export class StatisticsService {
    getDatabaseCounts() {
        return getConnection()
            .query(
                `with t1 as (
            select count(*) objects 
            from fgs_objects
        ), t2 as (
            select count(*) models 
            from fgs_models
        ), t3 as (
            select count(*) authors 
            from fgs_authors
        ), t4 as (
            select count(*) navaids 
            from fgs_navaids
        ), t5 as (
            select count(*) pends 
            from fgs_position_requests
        ), t6 as (
            select count(*) gndelevs 
            from fgs_objects 
            where ob_gndelev=-9999
        ) 
        select objects, models, authors, navaids, pends, gndelevs 
        from t1, t2, t3, t4, t5, t6`,
            )
            .then((result) => {
                const row = result.length ? result[0] : {};
                return {
                    objects: Number(row.objects || 0),
                    models: Number(row.models || 0),
                    authors: Number(row.authors || 0),
                    navaids: Number(row.navaids || 0),
                    pending: Number(row.pends || 0),
                    groundElevations: Number(row.gndelevs || 0),
                };
            });
    }

    getStatistics() {
        return getConnection()
            .query('SELECT * from fgs_statistics ORDER BY st_date')
            .then((result) => {
                return result.map(this.rowToStatistic);
            });
    }

    rowToStatistic(row) {
        return {
            date: row.st_date,
            objects: Number(row.st_objects),
            models: Number(row.st_models),
            authors: Number(row.st_authors),
            signs: Number(row.st_signs),
            navaids: Number(row.st_navaids),
        };
    }

    getStatisticsModelsByAuthor(paging: Paging) {
        return getConnection()
            .query(
                `SELECT COUNT(mo_id) AS count, au_name, au_id 
        FROM fgs_models, fgs_authors 
        WHERE mo_author = au_id
        GROUP BY au_id
        ORDER BY count DESC
        limit $1 offset $2`,
                [paging.limit, paging.offset],
            )
            .then((result) => {
                console.log('result', result)
                return result.map(this.rowToAuthorAndCount)
            });
    }

    getStatisticsModelsByAuthorAndRange(paging: Paging, days: number) {
        return getConnection()
            .query(
                `SELECT COUNT(mo_id) AS count, au_name, au_id \
        FROM fgs_models, fgs_authors \
        WHERE mo_author = au_id and mo_modified > now()::date - (interval '1 days' * $3) \
        GROUP BY au_id \
        ORDER BY count DESC \
        limit $1 offset $2`,
                [paging.limit, paging.offset, days],
            )
            .then((result) => result.map(this.rowToAuthorAndCount));
    }

    rowToAuthorAndCount(row) {
        return {
            id: Number(row.au_id),
            name: row.au_name.trim(),
            count: Number(row.count),
        };
    }

    getModelsByCountry(paging: Paging) {
        return getConnection()
            .query(
                'SELECT co_code, trim(co_name) as co_name, \
                          co_three, \
                          COUNT(ob_id) AS count, \
                          COUNT(ob_id)/(SELECT shape_sqm/10000000000 FROM gadm2_meta WHERE iso ILIKE co_three) AS density \
                    FROM fgs_objects \
                    INNER JOIN fgs_countries ON ob_country = co_code \
                    WHERE co_three IS NOT NULL \
                    GROUP BY co_code \
                    HAVING COUNT(ob_id)/(SELECT shape_sqm FROM gadm2_meta WHERE iso ILIKE co_three) > 0 \
                    ORDER BY count DESC \
                    limit $1 offset $2',
                    [paging.limit, paging.offset],
            )
            .then((result) => result.map(this.rowToModelsByCountry));
    }

    getModelsByCountryAndRange(paging: Paging, days: number) {
        return getConnection()
            .query(
                `SELECT co_code, trim(co_name) as co_name, \
                          co_three, \
                          COUNT(ob_id) AS count, \
                          COUNT(ob_id)/(SELECT shape_sqm/10000000000 FROM gadm2_meta WHERE iso ILIKE co_three) AS density \
                    FROM fgs_objects \
                    INNER JOIN fgs_countries ON ob_country = co_code \
                    WHERE co_three IS NOT NULL \
                    AND ob_modified > now()::date - (interval '1 days' * $3) \
                    GROUP BY co_code \
                    HAVING COUNT(ob_id)/(SELECT shape_sqm FROM gadm2_meta WHERE iso ILIKE co_three) > 0 \
                    ORDER BY count DESC \
                    limit $1 offset $2`,
                    [paging.limit, paging.offset, days],
            )
            .then((result) => result.map(this.rowToModelsByCountry));
    }

    rowToModelsByCountry(row) {
        return {
            code: row.co_code.trim(),
            codeThree: row.co_three.trim(),
            name: row.co_name.trim(),
            count: Number(row.count),
            density: Number(row.density || 0),
        };
    }
}
