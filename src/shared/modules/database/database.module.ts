import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseService } from './database.service';
import { ImageTaskRepository } from './repositories/image-task.repository';
import { ImageTask, ImageTaskSchema } from './schemas/image-task.schema';

import { EnvModule } from '@/shared/modules/env/env.module';
import { EnvService } from '@/shared/modules/env/env.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ImageTask.name, schema: ImageTaskSchema },
		]),
		MongooseModule.forRootAsync({
			imports: [EnvModule],
			useFactory: (envService: EnvService) => ({
				uri: envService.getKey('MONGODB_URI'),
				auth: {
					username: envService.getKey('MONGODB_USER'),
					password: envService.getKey('MONGODB_PASSWORD'),
				},
				dbName: envService.getKey('MONGODB_DATABASE'),
			}),
			inject: [EnvService],
		}),
	],
	providers: [DatabaseService, ImageTaskRepository],
	exports: [DatabaseService, MongooseModule, ImageTaskRepository],
})
export class DatabaseModule {}
