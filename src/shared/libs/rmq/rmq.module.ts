import {
	DynamicModule,
	InjectionToken,
	Module,
	ModuleMetadata,
	Provider,
} from '@nestjs/common';
import amqp, { Channel } from 'amqplib';

import { RmqService } from './rmq.service';
import { ImageProducerService } from './services/image-producer.service';

import {
	RABBITMQ_CHANNEL_TOKEN,
	RABBITMQ_QUEUE_TOKEN,
	RABBITMQ_URL_TOKEN,
} from '@/core/consts/provider-tokens';

interface RmqModuleParams {
	url: string;
	queueName: string;
}

interface RmqModuleAsyncParams
	extends Pick<ModuleMetadata, 'imports' | 'providers'> {
	useFactory: (...args: any[]) => RmqModuleParams | Promise<RmqModuleParams>;
	inject?: InjectionToken[];
}

@Module({})
export class RmqModule {
	static forRoot(params: RmqModuleParams): DynamicModule {
		const channelProvider: Provider = {
			provide: RABBITMQ_CHANNEL_TOKEN,
			useFactory: async (): Promise<Channel> => {
				const conn = await amqp.connect(params.url);
				const ch = await conn.createChannel();
				await ch.assertQueue(params.queueName, { durable: true });
				return ch;
			},
		};

		const urlProvider: Provider = {
			provide: RABBITMQ_URL_TOKEN,
			useValue: params.url,
		};
		const queueProvider: Provider = {
			provide: RABBITMQ_QUEUE_TOKEN,
			useValue: params.queueName,
		};

		return {
			module: RmqModule,
			providers: [
				channelProvider,
				urlProvider,
				queueProvider,
				ImageProducerService,
				RmqService,
			],
			exports: [
				RABBITMQ_CHANNEL_TOKEN,
				RABBITMQ_QUEUE_TOKEN,
				ImageProducerService,
				RmqService,
			],
		};
	}

	static forRootAsync(params: RmqModuleAsyncParams) {
		const channelProvider: Provider = {
			provide: RABBITMQ_CHANNEL_TOKEN,
			useFactory: async (...args: unknown[]) => {
				const opts = await params.useFactory(...args);
				const conn = await amqp.connect(opts.url);
				const ch = await conn.createChannel();
				await ch.assertQueue(opts.queueName, { durable: true });
				return ch;
			},
			inject: params.inject ?? [],
		};

		const urlProvider: Provider = {
			provide: RABBITMQ_URL_TOKEN,
			useFactory: async (...args: unknown[]) => {
				const opts = await params.useFactory(...args);
				return opts.url;
			},
			inject: params.inject ?? [],
		};
		const queueProvider: Provider = {
			provide: RABBITMQ_QUEUE_TOKEN,
			useFactory: async (...args: unknown[]) => {
				const opts = await params.useFactory(...args);
				return opts.queueName;
			},
			inject: params.inject ?? [],
		};

		return {
			module: RmqModule,
			imports: params.imports ?? [],
			providers: [
				channelProvider,
				urlProvider,
				queueProvider,
				ImageProducerService,
				RmqService,
			],
			exports: [
				RABBITMQ_CHANNEL_TOKEN,
				RABBITMQ_QUEUE_TOKEN,
				ImageProducerService,
				RmqService,
			],
		};
	}
}
