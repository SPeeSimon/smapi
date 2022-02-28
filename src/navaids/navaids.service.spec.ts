import { Test, TestingModule } from '@nestjs/testing';
import { NavaidsService } from './navaids.service';

describe('NavaidsService', () => {
  let service: NavaidsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NavaidsService],
    }).compile();

    service = module.get<NavaidsService>(NavaidsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
