import { NestFactory } from '@nestjs/core';

import { WorkersModule } from './image-processor/image-processor.module';

async function bootstrap() {
	await NestFactory.createApplicationContext(WorkersModule);
}

bootstrap().catch((err) => {
	console.error('Worker failed to start: ', err);
	process.exit(1);
});
