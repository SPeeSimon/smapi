import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Paging } from 'src/shared/dto/Paging.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('Stats')
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
    @Get(['/models/byauthor/', '/models/byauthor/:limit?/:offset?/:days?'])
    findModelsByAuthor(@Param('limit') limit?: number, @Param('offset') offset?: number, @Param('days') days?: number) {
        if (days && days > 0) {
            return this.statisticsService.getStatisticsModelsByAuthorAndRange(new Paging(offset || 0, limit || 10), days)
                                         .then(this.wrapInModelsByAuthor);
        }
        return this.statisticsService.getStatisticsModelsByAuthor(new Paging(offset || 0, limit || 10))
                                     .then(this.wrapInModelsByAuthor);
    }

    @ApiParam({ name: 'limit', required: false })
    @ApiParam({ name: 'offset', required: false })
    @ApiParam({ name: 'days', required: false })
    @Get(['/models/bycountry', '/models/bycountry/:limit?/:offset?/:days?'])
    findModelsByCountry(@Param('limit') limit?: number, @Param('offset') offset?: number, @Param('days') days?: number) {
        if (days && days > 0) {
            return this.statisticsService.getModelsByCountryAndRange(new Paging(offset || 0, limit || 10), days)
                                         .then(this.wrapInModelsByCountry);
        }
        return this.statisticsService.getModelsByCountry(new Paging(offset || 0, limit || 10))
                                     .then(this.wrapInModelsByCountry);
    }

    private wrapInModelsByAuthor(result: any) {
        return { modelsbyauthor: result };
    }

    private wrapInModelsByCountry(result: any) {
        return { modelsbycountry: result, };
    }
}
