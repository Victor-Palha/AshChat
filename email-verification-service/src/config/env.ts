import { z } from "zod";

const applicationEnvSchema = z.object({
    AMQP_URI: z.string(),
    REDIS_URI: z.string(),
    SMTP_EMAIL: z.string(),
    SMTP_PASSWORD: z.string()
})

const applicationEnvConfig = applicationEnvSchema.safeParse(process.env);

if (!applicationEnvConfig.success) {
    console.log(applicationEnvConfig.error)
    throw new Error("Verify enviroment variables!");
}

export const env = applicationEnvConfig.data;