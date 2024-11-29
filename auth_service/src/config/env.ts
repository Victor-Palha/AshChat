import { readFileSync } from 'node:fs';
import {z} from 'zod';

const applicationEnvSchema = z.object({
    PORT: z.coerce.number().default(3003),
    NODE_ENV: z.string().default('development'),
    MONGODB_URI: z.string().url(),
    AMQP_URI: z.string().url(),
    JWT_TEMPORARY_TOKEN: z.string(),
    JWT_SECRET: z.string().default(readFileSync(`${__dirname}/../../private_key.pem`, 'utf8')),
})

process.env.JWT_SECRET = readFileSync(`${__dirname}/../../private_key.pem`, 'utf8');

const applicationEnvConfig = applicationEnvSchema.safeParse(process.env);

if (!applicationEnvConfig.success) {
    console.log(applicationEnvConfig.error)
    throw new Error("Verify enviroment variables!");
}

/**
 * The `env` constant holds the configuration data for the application environment.
 * It is imported from the `applicationEnvConfig` object.
 */
export const env = applicationEnvConfig.data;