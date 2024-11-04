import {z} from 'zod';

const applicationEnvSchema = z.object({
    PORT: z.coerce.number().default(3003),
    NODE_ENV: z.string().default('development'),
    JWT_SECRET: z.string(),
    MONGODB_URI: z.string().url(),
    AMQP_URI: z.string().url(),
    JWT_TEMPORARY_TOKEN: z.string(),
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_CLIENT_EMAIL: z.string(),
    FIREBASE_PRIVATE_KEY: z.string(),
})

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