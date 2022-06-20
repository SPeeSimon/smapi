import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';
import { User } from 'src/auth/dto/User.entity';
import { LoggedInUser } from 'src/auth/loggedinuser';
import { SubmissionsService } from './submissions.service';


class CreateRequestDto{}
class UpdateRequestDto{}

@ApiTags('Submission')
@Controller('/submissions/requests')
export class RequestsController {
    constructor(private readonly submissionsService: SubmissionsService) {}

    @Post()
    @RequireTokenAuthentication()
    create(@Body() createRequestDto: CreateRequestDto, @LoggedInUser() user: User) {
        return this.submissionsService.create(createRequestDto);
    }

    @Get(':id')
    // @RequireTokenAuthentication()
    async findOne(@Param('id') id: string, @LoggedInUser() user: User) {
        return this.submissionsService.findOne(+id);
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto, @LoggedInUser() user: User) {
        return this.submissionsService.update(+id, updateRequestDto);
    }

    @Delete(':id')
    @RequireTokenAuthentication()
    remove(@Param('id') id: string, @LoggedInUser() user: User) {
        return this.submissionsService.remove(+id);
    }
}
