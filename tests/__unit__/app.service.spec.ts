import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from '@/app.service';

import { ImageProducerService } from '@/shared/libs/rmq/services/image-producer.service';
import {
	ImageTask,
	ImageTaskStatusEnum,
} from '@/shared/modules/database/schemas/image-task.schema';

describe(AppService.name, () => {
	let appService: AppService;
	let imageProducerService: ImageProducerService;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			providers: [
				AppService,
				{
					provide: getModelToken(ImageTask.name),
					useValue: {},
				},
				{
					provide: ImageProducerService,
					useValue: {
						enqueue: jest.fn(),
					},
				},
			],
		}).compile();

		appService = app.get<AppService>(AppService);
		imageProducerService = app.get<ImageProducerService>(ImageProducerService);
	});

	it('should be defined', () => {
		expect(appService).toBeDefined();
	});

	describe('.enqueueImage', () => {
		it('should throw an error if no file is provided', async () => {
			jest.spyOn(imageProducerService, 'enqueue');

			const file = null!;

			await expect(appService.enqueueImage(file)).rejects.toThrow(
				'File is required',
			);
			expect(imageProducerService.enqueue).not.toHaveBeenCalled();
		});

		it('should call ImageProducerService.enqueue with right params', async () => {
			jest.spyOn(imageProducerService, 'enqueue').mockResolvedValueOnce({
				taskId: '123',
				status: ImageTaskStatusEnum.Pending,
			});

			const file = {
				destination: '/tmp/uploads',
				fieldname: 'file',
				filename: 'test.jpg',
			} as Express.Multer.File;

			const result = await appService.enqueueImage(file);

			expect(result).toStrictEqual({
				taskId: '123',
				status: ImageTaskStatusEnum.Pending,
			});
			expect(imageProducerService.enqueue).toHaveBeenCalledWith(file);
		});
	});
});
