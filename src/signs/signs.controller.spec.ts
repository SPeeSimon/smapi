import { Test, TestingModule } from '@nestjs/testing';
import { SignsController } from './signs.controller';
import { SignsService } from './signs.service';

describe('SignsController', () => {
  let controller: SignsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignsController],
      providers: [SignsService],
    }).compile();

    controller = module.get<SignsController>(SignsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
