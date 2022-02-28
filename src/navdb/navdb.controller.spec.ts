import { Test, TestingModule } from '@nestjs/testing';
import { NavdbController } from './navdb.controller';
import { NavdbService } from './navdb.service';

describe('NavdbController', () => {
  let controller: NavdbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NavdbController],
      providers: [NavdbService],
    }).compile();

    controller = module.get<NavdbController>(NavdbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
