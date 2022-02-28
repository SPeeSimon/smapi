import { Test, TestingModule } from '@nestjs/testing';
import { RssController } from './rss.news.controller';
import { RssService } from './rss.news.service';

describe('RssController', () => {
    let controller: RssController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RssController],
            providers: [RssService],
        }).compile();

        controller = module.get<RssController>(RssController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
