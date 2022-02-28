import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paging } from 'src/shared/Paging.dto';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService {
    removeEmail(news: News) {
        delete news.author?.email;
        return news;
    }

    constructor(@InjectRepository(News) private newsRepository: Repository<News>) {}

    findLatest(limit: number) {
        const options = {
            relations: ['author'],
            where: { timestamp: Raw((alias) => `${alias} > now() - interval '30 days'`) },
            order: { timestamp: 'DESC' },
            take: limit,
        } as FindManyOptions;
        return this.newsRepository.find(options).then((result) => result.map((n) => this.removeEmail(n)));
    }

    findAll(paging: Paging) {
        return this.newsRepository
            .find({
                relations: ['author'],
                order: { timestamp: 'DESC' },
                take: paging.limit,
                skip: paging.offset,
            } as FindManyOptions)
            .then((result) => result.map((n) => this.removeEmail(n)));
    }

    findOne(id: number) {
        return this.newsRepository.findOneOrFail(id, { relations: ['author'] }).then((result) => this.removeEmail(result));
    }

    create(createNewsDto: CreateNewsDto) {
        delete createNewsDto['id'];
        const news = this.newsRepository.create(createNewsDto);
        return this.newsRepository.save(news);
    }

    update(id: number, updateNewsDto: UpdateNewsDto) {
        return this.newsRepository.update(id, Object.assign({}, updateNewsDto));
    }

    remove(id: number) {
        return this.newsRepository.delete(id);
    }
}
