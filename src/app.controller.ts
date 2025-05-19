import {
	BadRequestException,
	Controller,
	Get,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AppService } from '@/app.service';

import { ImageProducerService } from '@/shared/modules/broker/services/image-producer.service';
import { ImageTaskStatusEnum } from '@/shared/modules/database/schemas/image-task.schema';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly imageQueue: ImageProducerService,
	) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Post('/upload')
	@UseInterceptors(FileInterceptor('image'))
	async upload(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('File is required');
		}
		const taskId = await this.imageQueue.enqueue(file);
		return { task_id: taskId, status: ImageTaskStatusEnum.Pending };
	}
}
