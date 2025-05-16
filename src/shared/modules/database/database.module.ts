import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseService } from './database.service';

import { EnvModule } from '@/shared/modules/env/env.module';
import { EnvService } from '@/shared/modules/env/env.service';

@Module({
	imports: [
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
	providers: [DatabaseService],
	exports: [DatabaseService],
})
export class DatabaseModule {}
