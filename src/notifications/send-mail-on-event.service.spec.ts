import { Test, TestingModule } from '@nestjs/testing';
import { SendMailOnEventService } from './send-mail-on-event.service';

describe('SendMailOnEventService', () => {
  let service: SendMailOnEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendMailOnEventService],
    }).compile();

    service = module.get<SendMailOnEventService>(SendMailOnEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
