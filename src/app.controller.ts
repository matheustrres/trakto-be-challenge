import {
	Controller,
	Get,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AppService } from '@/app.service';

import { ImageTaskStatusEnum } from '@/shared/modules/database/schemas/image-task.schema';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Post('/upload')
	@UseInterceptors(FileInterceptor('image'))
	async upload(@UploadedFile() file: Express.Multer.File): Promise<{
		taskId: string;
		status: ImageTaskStatusEnum;
	}> {
		return await this.appService.enqueueImage(file);
	}

	@Get('/status/:taskId')
	async getStatus(
		@Param('taskId') taskId: string,
	): Promise<{ status: ImageTaskStatusEnum }> {
		const status = await this.appService.getImageTaskStatus(taskId);
		return { status };
	}
}
