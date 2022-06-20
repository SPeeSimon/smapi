import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Header } from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { CreateFGSObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { ApiQuery, ApiResponse, ApiOkResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { FGSObject } from '../dao/entities/object.entity';
import { Paging } from 'src/shared/dto/Paging.dto';
import { toFeatureCollection } from 'src/shared/GeoJsonUtils';
import { CountriesService } from './countries.service';
import { ObjectGroupsService } from './objectgroups.service';
import { SearchFGSObjectDto } from './dto/search-object.dto';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';
import { User } from 'src/auth/dto/User.entity';
import { LoggedInUser } from 'src/auth/loggedinuser';
import { Boundary, BoundaryPipe } from 'src/shared/dto/Boundary.dto';

@ApiTags('Objects')
@Controller('/scenemodels/objects')
export class ObjectsController {
    constructor(private readonly objectsService: ObjectsService, private readonly countriesService: CountriesService, private readonly objectGroupsService: ObjectGroupsService) {}

    @Post()
    @RequireTokenAuthentication()
    create(@Body() createObjectDto: CreateFGSObjectDto, @LoggedInUser() user: User) {
        // router.post("/", [ authenticatedRequestValidation,
        //     checkBodyAndQuery('description').isString().trim().escape(),
        //     checkBodyAndQuery('longitude').isLength({max: 20}).isFloat({min: -180, max: 180}).toFloat(),       // .isLatLong()
        //     checkBodyAndQuery('latitude').isLength({max: 20}).isFloat({min: -90, max: 90}).toFloat(),
        //     checkBodyAndQuery('obOffset').optional().isNumeric().isInt({min: -1000, max: 1000}),
        //     checkBodyAndQuery('heading').isNumeric().isInt({min: 0, max: 360}).toInt(),
        //     checkBodyAndQuery('countryCode').isISO31661Alpha2(),
        //     checkBodyAndQuery('modelId').isNumeric().isInt({min: 1}).toInt(),
        //   ], function (request, response, next) {

        //     const errors = validationResult(request);
        //     if (!errors.isEmpty()) {
        //       return response.status(400).json({ errors: errors.array() });
        //     }
        return this.objectsService.create(createObjectDto);
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    update(@Param('id') id: string, @Body() updateObjectDto: UpdateObjectDto, @LoggedInUser() user: User) {
        return this.objectsService.update(+id, updateObjectDto);
    }

    @Delete(':id')
    @RequireTokenAuthentication()
    remove(@Param('id') id: string, @LoggedInUser() user: User) {
        return this.objectsService.remove(+id);
    }

    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @ApiOkResponse({ type: FGSObject, isArray: true, description: 'Returns the Object with the given id' })
    @ApiNotFoundResponse({ description: 'No Object with the given id is found' })
    @Get('/list')
    findAll(@Query('offset') offset: number = 0, @Query('limit') limit: number = 100): Promise<FGSObject[]> {
        return this.objectsService.findAll(new Paging(offset, limit));
        // .then((result) => {
        //   return toFeatureCollection(result);
        // })
    }

    @Header('Cache-Control', 'public, max-age=604800')
    @Get('/groups')
    getGroups() {
        return this.objectGroupsService.findAll();
        //     ETAG: objectGroups.map((g) => g.id).join(""),
    }

    @ApiQuery({ name: 'searchCriteria', required: false, type: SearchFGSObjectDto })
    @Get('/search')
    find(@Query() searchCriteria: Partial<SearchFGSObjectDto>) {
        return this.objectsService.searchObject(searchCriteria).then(toFeatureCollection);
    }

    @Get('/countries')
    getCountries() {
        return this.countriesService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: Object, description: 'Returns the Object with the given id' })
    @ApiNotFoundResponse({ description: 'No Object with the given id is found' })
    findOne(@Param('id') id: string) {
        return this.objectsService.findOne(+id);
    }

    @ApiResponse({ status: 200, isArray: false })
    @Get(['/', '/within'])
    findWithinBoundary(@Query(BoundaryPipe) boundary: Boundary) { //: Promise<FeatureCollection<Point, Object>> {
        return this.objectsService.findWithinBoundary(boundary).then(toFeatureCollection);
    }

}
