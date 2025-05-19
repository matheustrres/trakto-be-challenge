import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

import { ImageProducerService } from '@/shared/modules/broker/services/image-producer.service';

import { ImageProcessorService } from '@/workers/image-processor/image-processor.service';

describe('AppController', () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				AppService,
				{
					provide: ImageProcessorService,
					useValue: {
						onModuleInit: jest.fn(),
						handleMessage: jest.fn(),
					},
				},
				{
					provide: ImageProducerService,
					useValue: {
						enqueue: jest.fn(),
					},
				},
			],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(appController.getHello()).toBe('Hello World!');
		});
	});
});
