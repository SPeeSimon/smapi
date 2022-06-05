import { Controller, Get, Header } from '@nestjs/common';
import { NewsService } from 'src/news/news.service';
import { Feed, FeedOptions, Item } from 'feed';

@Controller('/rss/news')
export class RssNewsController {
    constructor(private readonly newsService: NewsService) {}

    @Get()
    @Header('Content-type', 'application/rss+xml')
    async getLatestNews() {
        const feed = new Feed({
            title: 'FGFSDB Updates',
            link: `${process.env.SCENERY_NEWS_URL}`,
            language: 'en-GB',
            copyright: 'Jon Stockill 2006.',
            description: 'FlightGear scenery object database updates.',
            ttl: 720,
            favicon: `${process.env.SCENERY_URL}/favicon.ico`,
            generator: 'FlightGear Scenery News RSS',
        } as FeedOptions);

        const latestNewsPosts = await this.newsService.findLatest(10);
        latestNewsPosts.forEach((post) => {
            const url = `${process.env.SCENERY_NEWS_URL}/${post.id}`;
            feed.addItem({
                id: url,
                link: url,
                date: post.timestamp,
                description: post.text,
                author: [
                    {
                        name: post.author?.name,
                        link: post.author ? `${process.env.SCENERY_AUTHOR_URL}/${post.author?.id}`: '',
                    },
                ],
            } as Item);
        });

        return feed.rss2();
    }
}
