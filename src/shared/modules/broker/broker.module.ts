import { Global, Module } from '@nestjs/common';
import amqp, { Channel } from 'amqplib';

import { DatabaseModule } from '@/shared/modules/database/database.module';
import { EnvModule } from '@/shared/modules/env/env.module';
import { EnvService } from '@/shared/modules/env/env.service';
import {
	RABBITMQ_CHANNEL_TOKEN,
	RABBITMQ_IMAGE_OPTIMIZE_QUEUE,
} from '@/shared/tokens';

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
				await channel.assertQueue(RABBITMQ_IMAGE_OPTIMIZE_QUEUE, {
					durable: true,
				});
				return channel;
			},
			inject: [EnvService],
		},
	],
	exports: [RABBITMQ_CHANNEL_TOKEN],
})
export class BrokerModule {}
