import { Test, TestingModule } from '@nestjs/testing';
import { LinkAuthorController } from './link-author.controller';

describe('LinkAuthorController', () => {
  let controller: LinkAuthorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkAuthorController],
    }).compile();

    controller = module.get<LinkAuthorController>(LinkAuthorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
