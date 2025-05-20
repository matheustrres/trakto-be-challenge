import { NestFactory } from '@nestjs/core';

import { RmqWorkerModule } from './rmq-worker.module';

async function bootstrap() {
	await NestFactory.createApplicationContext(RmqWorkerModule);
}

bootstrap().catch((err) => {
	console.error('Worker failed to start: ', err);
	process.exit(1);
});
