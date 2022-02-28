import { Controller, Get, Header } from '@nestjs/common';
import { Feed, FeedOptions, Item } from 'feed';
import { ModelsService } from 'src/models/models.service';

@Controller('/rss/models')
export class RssModelController {
    constructor(private readonly modelService: ModelsService) {}

    @Get()
    @Header('Content-type', 'application/rss+xml')
    async getLatestNews() {
        const feed = new Feed({
            title: 'FGFSDB Updates',
            link: `${process.env.SCENERY_MODELS_URL}`,
            language: 'en-GB',
            copyright: 'Jon Stockill 2006-2008.',
            description: 'FlightGear scenery object database model additions.',
            ttl: 720,
            favicon: `${process.env.SCENERY_URL}/favicon.ico`,
            generator: 'FlightGear Scenery Models RSS',
        } as FeedOptions);

        const latestNewsPosts = await this.modelService.findLatest(50);
        latestNewsPosts.forEach((model) => {
            const url = `${process.env.SCENERY_MODEL_URL}/${model.id}`;
            feed.addItem({
                title: model.name,
                id: url,
                link: url,
                date: model.lastUpdated,
                description: model.name,
                author: [
                    {
                        name: model.author.name,
                        email: 'noreply@flightgear.org', // model.author.email
                        link: `${process.env.SCENERY_AUTHOR_URL}/${model.author.id}`,
                    },
                ],
            } as Item);
        });

        return feed.rss2();
    }
}
