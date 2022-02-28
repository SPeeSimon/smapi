import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Header } from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { CreateFGSObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { ApiQuery, ApiResponse, ApiOkResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { FGSObject } from './entities/object.entity';
import { Paging } from 'src/shared/Paging.dto';
import { toFeatureCollection } from 'src/shared/GeoJsonUtils';
import { CountriesService } from './countries.service';
import { ObjectGroupsService } from './objectgroups.service';
import { SearchFGSObjectDto } from './dto/search-object.dto';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';

@ApiTags('objects')
@Controller('/scenemodels/objects')
export class ObjectsController {
    constructor(private readonly objectsService: ObjectsService, private readonly countriesService: CountriesService, private readonly objectGroupsService: ObjectGroupsService) {}

    @Post()
    @RequireTokenAuthentication()
    create(@Body() createObjectDto: CreateFGSObjectDto) {
        return this.objectsService.create(createObjectDto);

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

        //     const data = matchedData(request);
        //     const description = data.description;
        //     const longitude = data.longitude;
        //     const latitude = data.latitude;
        //     const obOffset = data.obOffset;
        //     const heading = data.heading;
        //     const countryCode = data.countryCode;
        //     const modelId = data.modelId;

        //     new ObjectDAO().addObject(data)
        //       .then((result) => {
        //         return response.json(toFeatureCollection(result));
        //       })
        //       .catch((err) => {
        //         return response.status(500).send("Database Error");
        //       });
        //   });
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    update(@Param('id') id: string, @Body() updateObjectDto: UpdateObjectDto) {
        return this.objectsService.update(+id, updateObjectDto);
        // router.put("/:id", [
        //     authenticatedRequestValidation,
        //   ],
        //     function (request, response, next) {
        //     var id = Number(request.params.id);

        //     if (isNaN(id)) {
        //       return response.status(500).send("Invalid Request");
        //     }

        //     new ObjectDAO().updateObject(data)
        //       .then((result) => {
        //         if (0 == result.rows.length) {
        //           return response.status(404).send("updating object failed");
        //         }
        //         return response.json(rowToObjectFeature(result.rows[0]));
        //       })
        //       .catch((err) => {
        //         return response.status(500).send("Database Error");
        //       });
        //   });
    }

    @Delete(':id')
    @RequireTokenAuthentication()
    remove(@Param('id') id: string) {
        return this.objectsService.remove(+id);
        // router.delete("/:id", [
        //   authenticatedRequestValidation,
        //   param('id').isInt(),
        // ],
        //   function (request, response, next) {
        //   var id = Number(request.params.id);

        //   new ObjectDAO().deleteObject(id)
        //     .then((result) => {
        //       if (result) {
        //         return response.status(404).send(`deleting object with id ${id} failed`);
        //       }
        //       return response.status(204).send("Deleted");
        //     })
        //     .catch((err) => {
        //       return response.status(500).send("Database Error");
        //     });
        // });
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
        return this.objectsService.searchObject(searchCriteria);
        //   .then((result) => {
        //     return response.json(toFeatureCollection(result));
        //   });
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
        //       .then(m => {
        //         const obj = rowToObjectFeature(result)
        //         obj.properties.model_name = m.name;
        //         return response.json(obj);
        //       })
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
        return this.objectsService.findWithinBoundary(east, west, north, south).then((result) => {
            return toFeatureCollection(result);
        });
        // new ObjectDAO().searchObject(
        //   new ObjectSearchQuery()
        //       .forBoundary(north, east, south, west)
        // )
        //   .then((result) => {
        //     return response.json(toFeatureCollection(result));
        //   })
    }

    rowToObjectProperties(row) {
        return Object.assign(
            {
                id: row.id,
                title: row.title,
                heading: row.position.heading,
                gndelev: row.position.groundElevation,
                elevoffset: row.position.elevationOffset,
                model_id: row.model_id,
                model_name: row.model_name,
                stg: row.stg,
                country: row.country,
            },
            this.rowToModelGroup(row),
            this.rowToObjectsGroup(row),
        );
    }

    rowToModelGroup(row) {
        if (row.modelgroup) {
            return {
                modelgroup: row.modelgroup,
            };
        }
        return {};
    }

    rowToObjectsGroup(row) {
        if (row.objectsgroup && row.objectsgroup.id) {
            return {
                objectsgroup: row.objectsgroup,
            };
        }
        return {};
    }
}
