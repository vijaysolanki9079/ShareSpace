import { defineConfig, env } from '@prisma/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  datasource: {
    url: env("DIRECT_URL"),
  },
  schema: "./prisma/schema.prisma"
});
