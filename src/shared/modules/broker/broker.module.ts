import { Global, Module } from '@nestjs/common';
import amqp, { Channel } from 'amqplib';

import { ImageProducerService } from './services/image-producer.service';

import { RABBITMQ_CHANNEL_TOKEN } from '@/consts/provider-tokens';

import { DatabaseModule } from '@/shared/modules/database/database.module';
import { EnvModule } from '@/shared/modules/env/env.module';
import { EnvService } from '@/shared/modules/env/env.service';

@Global()
@Module({
	imports: [DatabaseModule, EnvModule],
	providers: [
		{
			provide: RABBITMQ_CHANNEL_TOKEN,
			useFactory: async (envService: EnvService): Promise<Channel> => {
				const connection = await amqp.connect(
					envService.getKeyOrThrow('RABBITMQ_URL'),
				);
				const channel = await connection.createChannel();
				await channel.assertQueue(
					envService.getKey('RABBITMQ_IMAGE_OPTIMIZE_QUEUE'),
					{
						durable: true,
					},
				);
				return channel;
			},
			inject: [EnvService],
		},
		ImageProducerService,
	],
	exports: [RABBITMQ_CHANNEL_TOKEN, ImageProducerService],
})
export class BrokerModule {}
