import fs from 'node:fs';

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channel, ConsumeMessage } from 'amqplib';
import { Model } from 'mongoose';
import sharp from 'sharp';

import { RABBITMQ_CHANNEL_TOKEN } from '@/consts/provider-tokens';

import {
	ImageTask,
	ImageTaskStatusEnum,
} from '@/shared/modules/database/schemas/image-task.schema';
import { EnvService } from '@/shared/modules/env/env.service';
import { parseExif } from '@/shared/utils/exif-reader';

@Injectable()
export class ImageProcessorService implements OnModuleInit {
	readonly #logger = new Logger(ImageProcessorService.name);

	constructor(
		@InjectModel(ImageTask.name)
		private readonly imageTaskModel: Model<ImageTask>,
		@Inject(RABBITMQ_CHANNEL_TOKEN) private readonly channel: Channel,
		private readonly envService: EnvService,
	) {}

	async onModuleInit(): Promise<void> {
		const queue = this.envService.getKeyOrThrow(
			'RABBITMQ_IMAGE_OPTIMIZE_QUEUE',
		);
		await this.channel.assertQueue(queue, { durable: true });
		await this.channel.prefetch(1);

		this.#logger.log(`⏳ Listening on queue "${queue}"`);
		await this.channel.consume(
			queue,
			async (msg) => await this.#handleMessage(msg),
			{
				noAck: false,
			},
		);
	}

	async #handleMessage(msg: ConsumeMessage | null): Promise<void> {
		if (!msg) return;
		const { taskId, tmpPath } = JSON.parse(msg.content.toString());
		this.#logger.log(`Processing image task ${taskId} (${tmpPath})`);

		try {
			await this.imageTaskModel.updateOne(
				{ taskId },
				{ status: ImageTaskStatusEnum.Processing },
			);

			const image = sharp(tmpPath);
			const imageMetadata = await image.metadata();

			const originalMetadata = {
				width: imageMetadata.width,
				height: imageMetadata.height,
				mimetype: imageMetadata.format,
				exif: imageMetadata.exif ? parseExif(imageMetadata.exif) : undefined,
			};

			const destDir = `/images/${taskId}-${
				originalMetadata.width
			}x${originalMetadata.height}`;

			await fs.promises.mkdir(destDir, { recursive: true });

			const paths = {
				low: `${destDir}/low.jpg`,
				medium: `${destDir}/medium.jpg`,
				high: `${destDir}/high.jpg`,
			};

			await Promise.all([
				image.resize({ width: 320 }).jpeg({ quality: 60 }).toFile(paths.low),
				image.resize({ width: 800 }).jpeg({ quality: 75 }).toFile(paths.medium),
				image.jpeg({ mozjpeg: true, quality: 85 }).toFile(paths.high),
			]);

			const stats = await Promise.all(
				Object.values(paths).map((p) => fs.promises.stat(p)),
			);

			const versions = {
				low: { path: paths.low, width: 320, size: stats[0]?.size },
				medium: { path: paths.medium, width: 800, size: stats[1]?.size },
				high: {
					path: paths.high,
					width: imageMetadata.width,
					size: stats[2]?.size,
				},
			};

			await this.imageTaskModel.updateOne(
				{ taskId },
				{
					status: ImageTaskStatusEnum.Completed,
					processedAt: new Date(),
					original_metadata: originalMetadata,
					versions,
				},
			);

			this.channel.ack(msg);
			this.#logger.log(`✔ Image task ${taskId} sucessfully processed`);
		} catch (error) {
			this.#logger.log(
				`Error processing image task ${taskId}`,
				(error as Error).stack,
			);
			await this.imageTaskModel.updateOne(
				{ taskId },
				{
					status: ImageTaskStatusEnum.Failed,
					errorMessage: (error as Error).message,
					processedAt: new Date(),
				},
			);
			this.channel.nack(msg, false, false);
		}
	}
}
