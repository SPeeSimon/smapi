import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Paging } from 'src/shared/Paging.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('stats')
@Controller('/scenemodels/stats')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Get('/')
    getDatabaseCounts() {
        return this.statisticsService.getDatabaseCounts();
    }

    @Get('/all')
    findAll() {
        return this.statisticsService.getStatistics().then((result) => {
            return { statistics: result };
        });
    }

    @ApiParam({ name: 'limit', required: false })
    @ApiParam({ name: 'offset', required: false })
    @ApiParam({ name: 'days', required: false })
    @Get('/models/byauthor/:limit?/:offset?/:days?')
    findModelsByAuthor(@Param('limit') limit, @Param('offset') offset, @Param('days') days) {
        if (days && days > 0) {
            return this.statisticsService
                .getStatisticsModelsByAuthorAndRange(new Paging(limit || 10, offset || 0), days)
                .then((result) => {
                    return { modelsbyauthor: result };
                });
        }
        return this.statisticsService.getStatisticsModelsByAuthor(new Paging(limit || 10, offset || 0)).then((result) => {
            return { modelsbyauthor: result };
        });
    }

    @ApiParam({ name: 'limit', required: false })
    @ApiParam({ name: 'offset', required: false })
    @ApiParam({ name: 'days', required: false })
    @Get('/models/bycountry/:limit?/:offset?/:days?')
    findModelsByCountry() {
        return this.statisticsService.getModelsByCountry().then((result) => {
            return {
                modelsbycountry: result,
            };
        });
    }
}
