import 'server-only';
import postgres from 'postgres';

const globalDb = globalThis as unknown as { __hsdPostgres?: ReturnType<typeof postgres> };

export function getDb() {
  if (globalDb.__hsdPostgres) return globalDb.__hsdPostgres;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL tanımlı değil. Supabase bağlantısını yapılandırın.');
  globalDb.__hsdPostgres = postgres(url, {
    ssl: 'require',
    prepare: false,
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    connection: { application_name: 'spot-the-ai', statement_timeout: 15000 },
  });
  return globalDb.__hsdPostgres;
}
