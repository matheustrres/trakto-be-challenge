import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from '@/app.service';

import { ImageProducerService } from '@/shared/libs/rmq/services/image-producer.service';
import { ImageTaskRepository } from '@/shared/modules/database/repositories/image-task.repository';
import {
	ImageTask,
	ImageTaskStatusEnum,
} from '@/shared/modules/database/schemas/image-task.schema';

describe(AppService.name, () => {
	let appService: AppService;
	let imageTaskRepository: ImageTaskRepository;
	let imageProducerService: ImageProducerService;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			providers: [
				AppService,
				{
					provide: ImageTaskRepository,
					useValue: { findOne: jest.fn() },
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
		imageTaskRepository = app.get<ImageTaskRepository>(ImageTaskRepository);
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

	describe('.getImageTaskStatus', () => {
		it('should throw an error if no task is found', async () => {
			jest.spyOn(imageTaskRepository, 'findOne').mockResolvedValueOnce(null);

			const taskId = '123';

			await expect(appService.getImageTaskStatus(taskId)).rejects.toThrow(
				'Task not found',
			);
			expect(imageTaskRepository.findOne).toHaveBeenCalledWith(taskId);
		});

		it('should return the task status if task is found', async () => {
			const task: ImageTask = {
				taskId: '123',
				originalFilename: 'test.jpg',
				status: ImageTaskStatusEnum.Pending,
				originalMetadata: {
					height: 100,
					width: 100,
					mimetype: 'image/jpeg',
				},
			};

			jest.spyOn(imageTaskRepository, 'findOne').mockResolvedValueOnce(task);

			const result = await appService.getImageTaskStatus(task.taskId);

			expect(result).toBe('PENDING');
		});
	});
});
