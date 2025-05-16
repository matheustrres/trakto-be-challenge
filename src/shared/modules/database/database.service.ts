import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { type Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
	constructor(
		@InjectConnection()
		private readonly connection: Connection,
	) {}

	getConnection(): Connection {
		return this.connection;
	}
}
