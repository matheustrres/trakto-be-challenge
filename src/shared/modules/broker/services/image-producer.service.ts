import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path, { extname } from 'node:path';

import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channel } from 'amqplib';
import { Model } from 'mongoose';

import { RABBITMQ_CHANNEL_TOKEN } from '@/consts/provider-tokens';

import {
	ImageTask,
	ImageTaskStatusEnum,
} from '@/shared/modules/database/schemas/image-task.schema';
import { EnvService } from '@/shared/modules/env/env.service';

@Injectable()
export class ImageProducerService {
	constructor(
		@Inject(RABBITMQ_CHANNEL_TOKEN)
		private readonly channel: Channel,
		@InjectModel(ImageTask.name)
		private readonly imageTaskModel: Model<ImageTask>,
		private readonly envService: EnvService,
	) {}

	async enqueue(file: Express.Multer.File): Promise<string> {
		const taskId = randomUUID();

		const uploadDir = '/tmp/uploads';
		await fs.promises.mkdir(uploadDir, { recursive: true });

		const tmpPath = path.join(
			uploadDir,
			`${taskId}${extname(file.originalname)}`,
		);
		await fs.promises.writeFile(tmpPath, file.buffer);

		await this.imageTaskModel.create({
			taskId,
			originalFilename: file.originalname,
			status: ImageTaskStatusEnum.Pending,
		});

		this.channel.sendToQueue(
			this.envService.getKey('RABBITMQ_IMAGE_OPTIMIZE_QUEUE'),
			Buffer.from(JSON.stringify({ taskId, tmpPath })),
			{ persistent: true },
		);

		return taskId;
	}
}
