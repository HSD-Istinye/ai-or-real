import { createRequire } from 'node:module';
import postgres from 'postgres';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
export function connect() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL gerekli; .env.local dosyasına Supabase transaction pooler bağlantısını ekleyin.');
  return postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false, max: 1, connect_timeout: 10 });
}
