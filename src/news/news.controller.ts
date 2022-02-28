import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { ApiQuery, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { News } from './entities/news.entity';
import { Paging } from 'src/shared/Paging.dto';
import { User } from 'src/auth/entities/user.entity';
import { LoggedInUser } from 'src/auth/loggedinuser';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';

@ApiTags('news')
@Controller('/news')
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @Post()
    @RequireTokenAuthentication()
    @ApiOkResponse({ description: "News item is created and it's content returned" })
    @ApiBadRequestResponse({ description: "Required values were missing" })
    create(@Body() createNewsDto: CreateNewsDto, @LoggedInUser() user: User) {
        const loggedInAuthor = user.author;
        return this.newsService.create(Object.assign({}, createNewsDto, { author: {id: loggedInAuthor.id, name: loggedInAuthor.name}}));
    }

    @Get('/latest')
    @ApiQuery({ name: 'limit', required: false })
    @ApiOkResponse({ type: News, isArray: true })
    findLatest(@Query('limit') limit: number = 10): Promise<News[]> {
        return this.newsService.findLatest(limit);
    }

    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @ApiOkResponse({ type: News, isArray: true })
    @Get('/list')
    findAll(@Query('offset') offset: number = 0, @Query('limit') limit: number = 10): Promise<News[]> {
        return this.newsService.findAll(new Paging(offset, limit));
    }

    @Get(':id')
    @ApiOkResponse({ type: News, description: 'Returns the News item with the given id' })
    @ApiNotFoundResponse({ description: 'No News item with the given id is found' })
    findOne(@Param('id') id: number): Promise<News> {
        return this.newsService.findOne(+id);
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    @ApiOkResponse({ description: "News item is updated and it's content returned" })
    @ApiNotFoundResponse({ description: 'No News item with the given id is found' })
    @ApiBadRequestResponse({ description: "Required values were missing" })
    update(@Param('id') id: number, @Body() updateNewsDto: UpdateNewsDto) {
        return this.newsService.update(+id, updateNewsDto);
    }

    @Delete(':id')
    @RequireTokenAuthentication()
    @ApiOkResponse({ description: "News item is deleted" })
    remove(@Param('id') id: number) {
        return this.newsService.remove(+id);
    }
}
