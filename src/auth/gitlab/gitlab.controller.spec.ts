import { Test, TestingModule } from '@nestjs/testing';
import { GitlabController } from './gitlab.controller';
import { GitlabService } from './gitlab.service';

describe('GitlabController', () => {
  let controller: GitlabController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitlabController],
      providers: [GitlabService],
    }).compile();

    controller = module.get<GitlabController>(GitlabController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
