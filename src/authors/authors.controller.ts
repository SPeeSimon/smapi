import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UnauthorizedException, Logger } from '@nestjs/common';
import { ApiQuery, ApiOkResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';
import { Paging } from 'src/shared/dto/Paging.dto';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from '../dao/entities/author.entity';
import { User } from 'src/auth/dto/User.entity';
import { LoggedInUser } from 'src/auth/loggedinuser';

@ApiTags('Authors')
@Controller('/scenemodels/authors')
export class AuthorsController {
    constructor(private readonly authorsService: AuthorsService) {}

    @ApiQuery({ name: 'limit', required: false, description: 'Limit the result. If given, must be between 20-10000' })
    @ApiQuery({ name: 'offset', required: false })
    @ApiOkResponse({ type: Author, isArray: true })
    @Get('/list')
    findAll(@Query('offset') offset: number = 0, @Query('limit') limit: number = 10): Promise<Author[]> {
        return this.authorsService.findAll(new Paging(offset, Math.min(10000, Math.max(20, limit))))
                                .then(result => {
                                    result.forEach(this.authorsService.removeEmail)
                                    return result;
                                });
    }

    @Post()
    @RequireTokenAuthentication()
    create(@Body() createAuthorDto: CreateAuthorDto, @LoggedInUser() user: User) {
        return this.authorsService.create(createAuthorDto);
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto, @LoggedInUser() user: User) {
        if (user.author.id !== id) {
            Logger.log(`Unauthorized usage: User (${user.author.id}) is updating data for different author (${id})`, 'Authorization');
            throw new UnauthorizedException({
                isError: true,
                error: 'updating data for other user'
            }, `You are only allowed to update your own data`);
        }
        return this.authorsService.update(+id, updateAuthorDto);
    }

    @Get(':id')
    @ApiOkResponse({ type: Author, description: 'Returns the Author with the given id' })
    @ApiNotFoundResponse({ description: 'No Author with the given id is found' })
    findOne(@Param('id') id: string) {
        return this.authorsService.findOne(+id)
        .then(result => {
            return this.authorsService.removeEmail(result);
        });
    }

}
