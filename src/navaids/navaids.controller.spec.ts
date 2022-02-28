import { Test, TestingModule } from '@nestjs/testing';
import { NavaidsController } from './navaids.controller';
import { NavaidsService } from './navaids.service';

describe('NavaidsController', () => {
  let controller: NavaidsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NavaidsController],
      providers: [NavaidsService],
    }).compile();

    controller = module.get<NavaidsController>(NavaidsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
