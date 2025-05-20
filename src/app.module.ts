import { randomUUID } from 'node:crypto';

import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

import { GlobalExceptionFilter } from '@/shared/lib/exceptions/global-exception-filter';
import { ZodExceptionFilter } from '@/shared/lib/exceptions/zod-exception-filter';
import { RmqModule } from '@/shared/libs/rmq/rmq.module';
import { DatabaseModule } from '@/shared/modules/database/database.module';
import { EnvModule } from '@/shared/modules/env/env.module';
import { EnvService } from '@/shared/modules/env/env.service';

const exceptionFilters = [GlobalExceptionFilter, ZodExceptionFilter];

@Module({
	imports: [
		RmqModule.forRootAsync({
			imports: [EnvModule, DatabaseModule],
			useFactory: async (envService: EnvService) => ({
				queueName: envService.getKeyOrThrow('RABBITMQ_IMAGE_OPTIMIZE_QUEUE'),
				url: envService.getKeyOrThrow('RABBITMQ_URL'),
			}),
			inject: [EnvService],
		}),
		DatabaseModule,
		MulterModule.register({
			storage: memoryStorage(),
		}),
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
				transport:
					process.env['NODE_ENV'] !== 'production'
						? {
								target: 'pino-pretty',
								options: {
									colorize: true,
									translateTime: 'HH:MM:ss.l',
									ignore: 'pid,hostname',
								},
							}
						: undefined,
				genReqId: (req) => req.id ?? randomUUID(),
				serializers: {
					req: (req) => ({
						id: req.id,
						method: req.method,
						url: req.url,
					}),
					res: (res) => ({
						statusCode: res.statusCode,
					}),
				},
				redact: ['req.headers.authorization', 'req.headers.cookie'],
				autoLogging: true,
			},
		}),
	],
	controllers: [AppController],
	providers: [
		AppService,
		...exceptionFilters.map((e) => ({
			provide: APP_FILTER,
			useClass: e,
		})),
	],
})
export class AppModule {}
