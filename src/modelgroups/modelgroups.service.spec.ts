import { Test, TestingModule } from '@nestjs/testing';
import { ModelgroupsService } from './modelgroups.service';

describe('ModelgroupsService', () => {
  let service: ModelgroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelgroupsService],
    }).compile();

    service = module.get<ModelgroupsService>(ModelgroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
