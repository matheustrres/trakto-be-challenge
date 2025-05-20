import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ImageProducerService } from '@/shared/modules/broker/services/image-producer.service';
import {
	ImageTask,
	ImageTaskStatusEnum,
} from '@/shared/modules/database/schemas/image-task.schema';

@Injectable()
export class AppService {
	constructor(
		@InjectModel(ImageTask.name)
		private readonly imageTaskModel: Model<ImageTask>,
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
		const task = await this.imageTaskModel.findOne({ taskId }).exec();
		if (!task) {
			throw new NotFoundException('Task not found');
		}
		return task.status;
	}
}
