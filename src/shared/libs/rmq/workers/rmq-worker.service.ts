import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConsumeMessage } from 'amqplib';
import { Model } from 'mongoose';

import { RmqService } from '@/shared/libs/rmq/rmq.service';
import { SharpService } from '@/shared/libs/sharp/sharp.service';
import {
	ImageTask,
	ImageTaskStatusEnum,
} from '@/shared/modules/database/schemas/image-task.schema';
import { EnvService } from '@/shared/modules/env/env.service';

@Injectable()
export class RmqWorkerService implements OnModuleInit {
	readonly #logger = new Logger(RmqWorkerService.name);

	constructor(
		@InjectModel(ImageTask.name)
		private readonly imageTaskModel: Model<ImageTask>,
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
			await this.imageTaskModel.updateOne(
				{ taskId },
				{ status: ImageTaskStatusEnum.Processing },
			);

			const { originalMetadata, versions } =
				await this.sharpService.processImage(
					tmpPath,
					`/images/${taskId}-${Date.now()}`,
				);

			await this.imageTaskModel.updateOne(
				{ taskId },
				{
					status: ImageTaskStatusEnum.Completed,
					processedAt: new Date(),
					original_metadata: originalMetadata,
					versions,
				},
			);

			this.#logger.log(`✔ Image task ${taskId} sucessfully processed`);
		} catch (error) {
			await this.imageTaskModel.updateOne(
				{ taskId },
				{
					status: ImageTaskStatusEnum.Failed,
					errorMessage: (error as Error).message,
					processedAt: new Date(),
				},
			);
			throw error;
		}
	}
}
