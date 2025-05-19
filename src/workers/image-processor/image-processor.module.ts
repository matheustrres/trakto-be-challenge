import { Module } from '@nestjs/common';

import { ImageProcessorService } from './image-processor.service';

import { BrokerModule } from '@/shared/modules/broker/broker.module';
import { DatabaseModule } from '@/shared/modules/database/database.module';
import { EnvModule } from '@/shared/modules/env/env.module';

@Module({
	imports: [EnvModule, BrokerModule, DatabaseModule],
	providers: [ImageProcessorService],
})
export class WorkersModule {}
