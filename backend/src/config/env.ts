import {z} from 'zod';

const applicationEnvSchema = z.object({
    PORT: z.coerce.number().default(3003),
    NODE_ENV: z.string().default('development'),
    JWT_SECRET: z.string(),
    MONGODB_URI: z.string().url()
})

const applicationEnvConfig = applicationEnvSchema.safeParse(process.env);

if (!applicationEnvConfig.success) {
    throw new Error(applicationEnvConfig.error.errors[0].message);
}

export const env = applicationEnvConfig.data;