import { z } from 'zod';

const defaultMongoUser = 'root';
const defaultMongoPassword = 'pass';
const defaultMongoDatabase = 'trakto';
const defaultMongoHost = 'mongo';
const defaultMongoPort = 27017;
const defaultMongoUri = `mongodb://${defaultMongoUser}:${defaultMongoPassword}@${defaultMongoHost}:${defaultMongoPort}/${defaultMongoDatabase}?authSource=admin`;

const defaultRabbitMQUser = 'guest';
const defaultRabbitMQPassword = 'guest';
const defaultRabbitMQHost = 'rabbitmq';
const defaultRabbitMQPort = 5672;
const defaultRabbitMQUrl = `amqp://${defaultRabbitMQUser}:${defaultRabbitMQPassword}@${defaultRabbitMQHost}:${defaultRabbitMQPort}`;

export const envSchema = z.object({
	PORT: z.coerce.number().optional().default(3333),
	MONGODB_USER: z.coerce.string().default(defaultMongoUser),
	MONGODB_PASSWORD: z.coerce.string().default(defaultMongoPassword),
	MONGODB_DATABASE: z.coerce.string().default(defaultMongoDatabase),
	MONGODB_PORT: z.coerce.number().default(defaultMongoPort),
	MONGODB_URI: z.coerce
		.string()
		.startsWith('mongodb://')
		.default(defaultMongoUri),
	RABBITMQ_USER: z.coerce.string().default(defaultRabbitMQUser),
	RABBITMQ_PASSWORD: z.coerce.string().default(defaultRabbitMQPassword),
	RABBITMQ_PORT: z.coerce.number().default(defaultRabbitMQPort),
	RABBITMQ_HOST: z.coerce.string().default(defaultRabbitMQHost),
	RABBITMQ_URL: z.coerce.string().default(defaultRabbitMQUrl),
	RABBITMQ_IMAGE_OPTIMIZE_QUEUE: z.coerce.string().default('image.optimize'),
});

export type Env = z.infer<typeof envSchema>;
