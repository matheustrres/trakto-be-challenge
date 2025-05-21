import { Inject, Injectable } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';

import { RABBITMQ_CHANNEL_TOKEN } from '@/core/consts/provider-tokens';

@Injectable()
export class RmqService {
	constructor(
		@Inject(RABBITMQ_CHANNEL_TOKEN) private readonly channel: Channel,
	) {}

	async consumeQueue(
		queue: string,
		callback: (msg: ConsumeMessage | null) => Promise<void>,
	) {
		await this.channel.assertQueue(queue, { durable: true });
		await this.channel.prefetch(1);
		await this.channel.consume(
			queue,
			async (msg) => {
				if (msg) {
					try {
						await callback(msg);
						this.channel.ack(msg);
					} catch (error) {
						console.error('Error processing message:', error);
						this.channel.nack(msg);
					}
				}
			},
			{ noAck: false },
		);
	}
}
