import { Controller, Get, Header, Logger } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { ApiTags } from '@nestjs/swagger';
import { TS, TsService } from './ts.service';

const HRS_8_IN_SECONDS = 8 * 60 * 60; // 8 hours

@ApiTags('Terrasync')
@Controller('ts')
export class TsController {

    constructor(private readonly tsService: TsService) {}


    @ApiOperation({ description: "Get a list of available [TerraSync](https://wiki.flightgear.org/TerraSync) mirrors and their status." })
    @ApiOkResponse({ description: 'Successfully retrieved the status of the available TerraSync mirrors' })
    @ApiInternalServerErrorResponse({ description: 'Error during retrieval of the available TerraSync mirrors or getting their status' })
    @Header('Cache-Control', 'public, max-age=' + HRS_8_IN_SECONDS)
    @Get('/status/')
    async getStatus() {
        const entries = await this.tsService.getEntries();

        const terrasyncAddressValues = await Promise.all(entries).catch((err) =>
            Logger.error(`Error retrieving ALL remote information: ${err}`, TS),
        ).then(r => (r as unknown[]).filter(c => c != null));

        return {
            title: 'Terrasync Status',
            entries: terrasyncAddressValues,
        };
    }
}
