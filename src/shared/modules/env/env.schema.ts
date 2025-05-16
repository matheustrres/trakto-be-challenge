import { z } from 'zod';

export const envSchema = z.object({
	PORT: z.coerce.number().optional().default(3333),
	MONGODB_USER: z.coerce.string().default('root'),
	MONGODB_PASSWORD: z.coerce.string().default('pass'),
	MONGODB_DATABASE: z.coerce.string().default('trakto'),
	MONGODB_PORT: z.coerce.number().default(27017),
	MONGODB_URI: z.coerce.string().startsWith('mongodb://'),
  RABBITMQ_USER: z.coerce.string().default('guest'),
  RABBITMQ_PASSWORD: z.coerce.string().default('guest'),
});

export type Env = z.infer<typeof envSchema>;
