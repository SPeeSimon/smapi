import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { News } from '../dao/entities/news.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([News])],
    controllers: [NewsController],
    providers: [NewsService],
    exports: [NewsService],
})
export class NewsModule {}
