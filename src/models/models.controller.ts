import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Header,
    Query,
    Redirect,
    Res,
    StreamableFile,
} from '@nestjs/common';
import { ModelsService } from './models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ApiParam, ApiOkResponse, ApiMovedPermanentlyResponse, ApiNotFoundResponse, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SearchModelDto } from './dto/search-model.dto';
import { Response } from 'express';
import { SingleFileTransmitter } from 'src/utils/FileUtils';
import { MultiStream } from 'src/utils/MultiStream';
import * as tar from 'tar';
import { ObjectsService } from 'src/objects/objects.service';
import { Paging } from 'src/shared/Paging.dto';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';
import { Model } from './entities/model.entity';
import { toFeatureCollection } from 'src/shared/GeoJsonUtils';

@ApiTags('Models')
@Controller('/scenemodels/models')
export class ModelsController {
    constructor(private readonly modelsService: ModelsService, private readonly objectsService: ObjectsService) {}

    @Post()
    @RequireTokenAuthentication()
    create(@Body() createModelDto: CreateModelDto) {
        return this.modelsService.create(createModelDto);
    }

    @Get('/list')
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    findAll(@Query('limit') limit, @Query('offset') offset) {
        return this.modelsService.findAll(limit || 10, offset || 0);
    }

    @Get('/bymg/:mg')
    @ApiParam({ name: 'mg', required: true, description: 'Id or name of the Modelgroup' })
    @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results' })
    findByModelGroup(@Param('mg') modelGroup: string|number, @Query('limit') limit: number, @Query('offset') offset: number) {
        return this.modelsService.searchModel({ modelgroup: modelGroup, limit: limit, offset: offset });
    }
    
    @Get('/search')
    @ApiQuery({ name: 'searchCriteria', required: false, type: SearchModelDto })
    findModel(@Query() filters: SearchModelDto) {
        return this.modelsService.searchModel(filters);
    }
    
    @Get('/search/byauthor/:id')
    @ApiParam({ name: 'id', required: true, description: 'Id of the Author' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    findModelByAuthor(@Param('id') id, @Query('limit') limit, @Query('offset') offset) {
        return this.modelsService.searchModel({ authorId: id, limit: limit, offset: offset });
    }

    @ApiQuery({ name: 'e', required: true, description: 'coordinate of position east' })
    @ApiQuery({ name: 'w', required: true, description: 'coordinate of position west' })
    @ApiQuery({ name: 'n', required: true, description: 'coordinate of position north' })
    @ApiQuery({ name: 's', required: true, description: 'coordinate of position south' })
    @ApiResponse({ status: 200, isArray: false })
    @Get(['/', '/within'])
    findWithinBoundary(
        @Query('e') east: number,
        @Query('w') west: number,
        @Query('n') north: number,
        @Query('s') south: number,
    ) { //: Promise<FeatureCollection<Point, Object>> {
        return this.modelsService.findWithinBoundary(east, west, north, south).then(toFeatureCollection);
    }

    
    @Get(':id')
    @ApiParam({ name: 'id', required: true, description: 'Id of the Model' })
    @ApiOkResponse({ type: Model, description: 'Returns the Model and entries with the given id' })
    @ApiNotFoundResponse({ description: 'No Model with the given id is found' })
    async findOne(@Param('id') id: string, @Res() response: Response) {
        const model = await this.modelsService.findOne(+id, { withModelFile: true, withThumbnail: false });
        model['content'] = [];

        await new MultiStream(Buffer.from(model.modelfile, 'base64'))
            .on('error', (e) => console.log('error reading stream', e))
            .pipe(tar.list()) // treat as archive
            .on('entry', (entry) =>
                model['content'].push({
                    filename: entry.header.path,
                    filesize: entry.header.size,
                }),
            ) // handle archive entries
            .on('end', () => {
                delete model.modelfile;
                response.send(model);
            }); // close stream
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    @ApiParam({ name: 'id', required: true, description: 'Id of the Model' })
    update(@Param('id') id: string, @Body() updateModelDto: UpdateModelDto) {
        return this.modelsService.update(+id, updateModelDto);
    }

    @Delete(':id')
    @RequireTokenAuthentication()
    @ApiParam({ name: 'id', required: true, description: 'Id of the Model' })
    @ApiNotFoundResponse({ description: 'No Model with the given id is found' })
    remove(@Param('id') id: string) {
        return this.modelsService.remove(+id);
    }

    @Get(':id/tgz')
    @Header('Content-type', 'application/x-gtar')
    @ApiParam({ name: 'id', required: true, description: 'Id of the Model' })
    @ApiOkResponse({ description: 'The full model file, packed in a zipped tar (tgz)' })
    @ApiNotFoundResponse({ description: 'Model not found or no model file'})
    async getModelFileAsZip(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {
        const modelFile = await this.modelsService.getModelFiles(+id);
        response.set({
            'Content-Type': 'application/x-gtar',
            'Content-Disposition': `attachment; filename="${modelFile.path}.tgz"`,
            'Last-Modified': modelFile.lastUpdated.toString(),
        });
        return new StreamableFile(Buffer.from(modelFile.modelfile, 'base64'));
    }

    @Get('/:id/thumb.jpg')
    @Header('Content-type', 'image/jpeg')
    @ApiParam({ name: 'id', required: true, description: 'Id of the Model' })
    @ApiOkResponse({ description: 'The thumbnail for the model' })
    @ApiNotFoundResponse({ description: 'Model not found or no image for the model'})
    async getThumbnail(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {
        const modelFile = await this.modelsService.getThumbnail(+id);
        response.set({
            'Content-Type': 'image/jpeg',
            'Content-Disposition': `filename="model_${id}.jpg"`,
            'Last-Modified': modelFile.lastUpdated.toString(),
        });
        return new StreamableFile(Buffer.from(modelFile.thumbfile, 'base64'));
    }

    @Get(':id/thumb')
    @Redirect('./thumb.jpg', 301)
    @ApiMovedPermanentlyResponse({ description: 'Redirects to ./thumb.jpg' })
    getThumbnail2(@Param('id') id: string) {}

    @Get('/:id/AC3D')
    @Header('Content-type', 'application/octet-stream')
    @ApiParam({ name: 'id', required: true, description: 'Id of the Model' })
    @ApiOkResponse({ description: 'The 3D file from the model file (.ac)' })
    @ApiNotFoundResponse({ description: 'Model not found or no model file'})
    async getAC3DFromModelFile(@Param('id') id: string, @Res() response: Response) {
        const result = await this.modelsService.getModelFiles(+id);
        const fileTransmitter = new SingleFileTransmitter().withFileFilter((path) => path.endsWith('.ac'));

        await new MultiStream(Buffer.from(result.modelfile, 'base64'))
            .on('error', (e) => console.log('error reading stream', e))
            .pipe(new tar.Parse()) // treat as archive
            .on('entry', (entry) => fileTransmitter.processArchiveEntry(entry, response, result.lastUpdated)) // handle archive entries
            .on('end', () => fileTransmitter.handleClosing(response)); // close stream of notify not found
    }

    @Get(['/:id/ac3d', '/:id/ac'])
    @Redirect('./AC3D', 301)
    @ApiMovedPermanentlyResponse({ description: 'Redirects to ./AC3D' })
    getAC3DFromModelFile2(@Param('id') id: string) {}

    @Get('/:id/model-content/:name')
    @ApiParam({ name: 'id', required: true, description: 'Id of the Model' })
    @ApiParam({ name: 'name', required: true, description: 'Filename within the Model file' })
    @ApiOkResponse({ description: 'The file from the model file' })
    @ApiNotFoundResponse({ description: 'Model not found or the requested file does not exist in de model file'})
    async getFileFromModelFile(@Param('id') id: string, @Param('name') fileName: string, @Res() response: Response) {
        const result = await this.modelsService.getModelFiles(+id);
        const fileTransmitter = new SingleFileTransmitter().withFileFilter((path) => path == fileName); // send requested file from archive

        await new MultiStream(Buffer.from(result.modelfile, 'base64')) // stream archive content
            .on('error', (e) => console.log('error reading stream', e)) // if error in streaming, log
            .pipe(new tar.Parse()) // treat as archive
            .on('entry', (entry) => fileTransmitter.processArchiveEntry(entry, response, result.lastUpdated)) // handle archive entries
            .on('end', () => fileTransmitter.handleClosing(response)); // close stream of notify not found
    }

    @Get('/:id/positions')
    @ApiParam({ name: 'id', required: true, description: 'Id of the Model' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @ApiOkResponse({ description: 'Returns the positions of the Model with the given id' })
    @ApiNotFoundResponse({ description: 'No Model with the given id is found' })
    async getModelPositions(@Param('id') id: string, @Query('limit') limit, @Query('offset') offset) {
        const positions = await this.objectsService.getObjectsByModel(+id, new Paging(offset, limit));
        return Object.assign({}, toFeatureCollection(positions), {model: id});
    }
}
