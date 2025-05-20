import { Module } from '@nestjs/common';

import { RmqWorkerService } from './rmq-worker.service';

import { RmqModule } from '@/shared/libs/rmq/rmq.module';
import { DatabaseModule } from '@/shared/modules/database/database.module';
import { EnvModule } from '@/shared/modules/env/env.module';
import { EnvService } from '@/shared/modules/env/env.service';

@Module({
	imports: [
		EnvModule,
		DatabaseModule,
		RmqModule.forRootAsync({
			imports: [EnvModule, DatabaseModule],
			useFactory: (envService: EnvService) => ({
				queueName: envService.getKeyOrThrow('RABBITMQ_IMAGE_OPTIMIZE_QUEUE'),
				url: envService.getKeyOrThrow('RABBITMQ_URL'),
			}),
			inject: [EnvService],
		}),
	],
	providers: [RmqWorkerService],
})
export class RmqWorkerModule {}
