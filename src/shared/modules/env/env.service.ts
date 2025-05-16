import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from './env.schema';

@Injectable()
export class EnvService {
	constructor(private readonly configService: ConfigService<Env, true>) {}

	getKey<T extends keyof Env>(key: T) {
		return this.configService.get<Env>(key, { infer: true });
	}

	getKeyOrThrow<T extends keyof Env>(key: T) {
		return this.configService.getOrThrow(key, {
			infer: true,
		});
	}

	setKey<T extends keyof Env>(key: T, value: any): void {
		this.configService.set(key, value);
	}
}
