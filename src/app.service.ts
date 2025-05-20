import { BadRequestException, Injectable } from '@nestjs/common';

import { ImageProducerService } from './shared/modules/broker/services/image-producer.service';
import { ImageTaskStatusEnum } from './shared/modules/database/schemas/image-task.schema';

@Injectable()
export class AppService {
	constructor(private readonly imageProducerService: ImageProducerService) {}

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
}
