import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiQuery, ApiOkResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';
import { Paging } from 'src/shared/Paging.dto';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@ApiTags('Authors')
@Controller('/scenemodels/authors')
export class AuthorsController {
    constructor(private readonly authorsService: AuthorsService) {}

    @ApiQuery({ name: 'limit', required: false, description: 'Limit the result. If given, must be between 20-10000' })
    @ApiQuery({ name: 'offset', required: false })
    @ApiOkResponse({ type: Author, isArray: true })
    @Get('/list')
    findAll(@Query('offset') offset: number = 0, @Query('limit') limit: number = 10): Promise<Author[]> {
        return this.authorsService.findAll(new Paging(offset, Math.min(10000, Math.max(20, limit))));
    }
    
    @Get(':id')
    @ApiOkResponse({ type: Author, description: 'Returns the Author with the given id' })
    @ApiNotFoundResponse({ description: 'No Author with the given id is found' })
    findOne(@Param('id') id: string) {
        return this.authorsService.findOne(+id);
    }

    @Post()
    @RequireTokenAuthentication()
    create(@Body() createAuthorDto: CreateAuthorDto) {
        return this.authorsService.create(createAuthorDto);
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
        return this.authorsService.update(+id, updateAuthorDto);
    }

    @Delete(':id')
    @RequireTokenAuthentication()
    remove(@Param('id') id: string) {
        return this.authorsService.remove(+id);
    }
}
