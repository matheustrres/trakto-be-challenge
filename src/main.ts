import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app.module';

import { EnvService } from '@/shared/modules/env/env.service';
import { Logger } from 'nestjs-pino';

(async () => {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	app.useLogger(app.get(Logger));
	app.enableShutdownHooks();

	const envService = app.get(EnvService);

	const port = envService.getKey('PORT');
	await app.listen(port);
})();
