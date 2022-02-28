import { Test, TestingModule } from '@nestjs/testing';
import { ModelgroupsController } from './modelgroups.controller';
import { ModelgroupsService } from './modelgroups.service';

describe('ModelgroupsController', () => {
  let controller: ModelgroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModelgroupsController],
      providers: [ModelgroupsService],
    }).compile();

    controller = module.get<ModelgroupsController>(ModelgroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
