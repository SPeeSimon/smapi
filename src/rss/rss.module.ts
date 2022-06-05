import { Module } from '@nestjs/common';
import { NewsModule } from 'src/news/news.module';
import { RssModelController } from './rss.model.controller';
import { RssNewsController } from './rss.news.controller';
import { ModelsModule } from 'src/models/models.module';

@Module({
  imports: [NewsModule, ModelsModule],
  controllers: [RssNewsController, RssModelController],
  providers: [],
})
export class RssModule {}
