import {z} from 'zod';

const applicationEnvSchema = z.object({
    PORT: z.coerce.number().default(3003),
    NODE_ENV: z.string().default('development'),
    JWT_SECRET: z.string(),
    MONGODB_URI: z.string().url(),
    AMQP_URI: z.string().url(),
})

const applicationEnvConfig = applicationEnvSchema.safeParse(process.env);

if (!applicationEnvConfig.success) {
    console.log(applicationEnvConfig.error)
    throw new Error("Verify enviroment variables!");
}

export const env = applicationEnvConfig.data;