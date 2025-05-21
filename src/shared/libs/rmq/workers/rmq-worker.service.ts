import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

import { RmqService } from '@/shared/libs/rmq/rmq.service';
import { SharpService } from '@/shared/libs/sharp/sharp.service';
import { ImageTaskRepository } from '@/shared/modules/database/repositories/image-task.repository';
import { ImageTaskStatusEnum } from '@/shared/modules/database/schemas/image-task.schema';
import { EnvService } from '@/shared/modules/env/env.service';

@Injectable()
export class RmqWorkerService implements OnModuleInit {
	readonly #logger = new Logger(RmqWorkerService.name);

	constructor(
		private readonly imageTaskRepository: ImageTaskRepository,
		private readonly envService: EnvService,
		private readonly rmqService: RmqService,
		private readonly sharpService: SharpService,
	) {}

	async onModuleInit(): Promise<void> {
		const queue = this.envService.getKeyOrThrow(
			'RABBITMQ_IMAGE_OPTIMIZE_QUEUE',
		);
		return this.rmqService.consumeQueue(queue, (msg) =>
			this.#handleMessage(msg),
		);
	}

	async #handleMessage(msg: ConsumeMessage | null): Promise<void> {
		const { taskId, tmpPath } = JSON.parse(msg!.content.toString());
		this.#logger.log(`Processing image task ${taskId} (${tmpPath})`);

		try {
			await this.imageTaskRepository.updateOne({
				taskId,
				status: ImageTaskStatusEnum.Processing,
				processedAt: new Date(),
			});

			const { originalMetadata, versions } =
				await this.sharpService.processImage(
					tmpPath,
					`/images/${taskId}-${Date.now()}`,
				);

			await this.imageTaskRepository.updateOne({
				taskId,
				status: ImageTaskStatusEnum.Completed,
				originalMetadata: {
					height: originalMetadata.height,
					width: originalMetadata.width,
					mimetype: originalMetadata.format,
					exif: originalMetadata.exif,
				},
				versions,
			});

			this.#logger.log(`✔ Image task ${taskId} sucessfully processed`);
		} catch (error) {
			await this.imageTaskRepository.updateOne({
				taskId,
				status: ImageTaskStatusEnum.Failed,
				errorMessage: (error as Error).message,
			});
			throw error;
		}
	}
}
