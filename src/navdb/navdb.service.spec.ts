import { Test, TestingModule } from '@nestjs/testing';
import { NavdbService } from './navdb.service';

describe('NavdbService', () => {
  let service: NavdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NavdbService],
    }).compile();

    service = module.get<NavdbService>(NavdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
