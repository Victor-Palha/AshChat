import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        env: {
            ...config({ path: "./.env" }).parsed,
        },
    },
});