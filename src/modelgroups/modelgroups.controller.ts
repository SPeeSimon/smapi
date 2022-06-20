import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Modelgroup } from '../dao/entities/modelgroup.entity';
import { ModelgroupsService } from './modelgroups.service';

@ApiTags('Modelgroup', 'Models')
@Controller('/scenemodels/modelgroups')
export class ModelgroupsController {
    constructor(private readonly modelgroupsService: ModelgroupsService) {}

    @Get()
    @ApiOkResponse({ type: Modelgroup, isArray: true, description: 'Returns all Modelgroups' })
    findAll() {
        return this.modelgroupsService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: Modelgroup, description: 'Returns the Modelgroup with the given id' })
    @ApiNotFoundResponse({ description: 'No Modelgroup with the given id is found' })
    findOne(@Param('id') id: number) {
        return this.modelgroupsService.findOne(+id);
    }
}
