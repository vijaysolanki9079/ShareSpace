import pg from "pg";

const { Client } = pg;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL (or DIRECT_URL) environment variable");
  }

  return connectionString;
}

export function createServerPgClient() {
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === "true";

  return new Client({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized },
  });
}