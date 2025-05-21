import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { ImageProducerService } from '@/shared/libs/rmq/services/image-producer.service';
import { ImageTaskRepository } from '@/shared/modules/database/repositories/image-task.repository';
import { ImageTaskStatusEnum } from '@/shared/modules/database/schemas/image-task.schema';

@Injectable()
export class AppService {
	constructor(
		private readonly imageTaskRepository: ImageTaskRepository,
		private readonly imageProducerService: ImageProducerService,
	) {}

	getHello(): string {
		return 'Hello World!';
	}

	async enqueueImage(
		file: Express.Multer.File,
	): Promise<{ taskId: string; status: ImageTaskStatusEnum }> {
		if (!file) {
			throw new BadRequestException('File is required');
		}
		return await this.imageProducerService.enqueue(file);
	}

	async getImageTaskStatus(taskId: string): Promise<ImageTaskStatusEnum> {
		const task = await this.imageTaskRepository.findOne(taskId);
		if (!task) {
			throw new NotFoundException('Task not found');
		}
		return task.status;
	}
}
