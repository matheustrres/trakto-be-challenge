import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path, { extname } from 'node:path';

import { Inject, Injectable } from '@nestjs/common';
import { Channel } from 'amqplib';

import { RABBITMQ_CHANNEL_TOKEN } from '@/core/consts/provider-tokens';

import { ImageTaskRepository } from '@/shared/modules/database/repositories/image-task.repository';
import { ImageTaskStatusEnum } from '@/shared/modules/database/schemas/image-task.schema';
import { EnvService } from '@/shared/modules/env/env.service';

@Injectable()
export class ImageProducerService {
	constructor(
		@Inject(RABBITMQ_CHANNEL_TOKEN)
		private readonly channel: Channel,
		private readonly imageTaskRepository: ImageTaskRepository,
		private readonly envService: EnvService,
	) {}

	async enqueue(file: Express.Multer.File): Promise<{
		taskId: string;
		status: ImageTaskStatusEnum;
	}> {
		const taskId = randomUUID();

		const uploadDir = '/tmp/uploads';
		await fs.promises.mkdir(uploadDir, { recursive: true });

		const tmpPath = path.join(
			uploadDir,
			`${taskId}${extname(file.originalname)}`,
		);
		await fs.promises.writeFile(tmpPath, file.buffer);

		const task = await this.imageTaskRepository.create({
			taskId,
			originalFilename: file.originalname,
			status: ImageTaskStatusEnum.Pending,
			originalMetadata: {
				height: 0,
				width: 0,
				mimetype: file.mimetype,
			},
		});

		this.channel.sendToQueue(
			this.envService.getKey('RABBITMQ_IMAGE_OPTIMIZE_QUEUE'),
			Buffer.from(JSON.stringify({ taskId, tmpPath })),
			{ persistent: true },
		);

		return {
			taskId,
			status: task.status,
		};
	}
}
