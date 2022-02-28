import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @RequireTokenAuthentication()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Get()
  @RequireTokenAuthentication()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  @RequireTokenAuthentication()
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }

  @Patch(':id')
  @RequireTokenAuthentication()
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(+id, updateRequestDto);
  }

  @Delete(':id')
  @RequireTokenAuthentication()
  remove(@Param('id') id: string) {
    return this.requestsService.remove(+id);
  }
}
