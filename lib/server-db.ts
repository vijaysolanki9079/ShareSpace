/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/server-db.ts
import pg from "pg";

const { Pool } = pg;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL (or DIRECT_URL) environment variable");
  }

  return connectionString;
}

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    const rejectUnauthorized =
      process.env.DB_SSL_REJECT_UNAUTHORIZED === "true";

    pool = new Pool({
      connectionString: getConnectionString(),
      ssl: rejectUnauthorized ? { rejectUnauthorized: true } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      pool = null;
    });
  }

  return pool;
}

// Execute a single query
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount,
    };
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute multiple queries in a transaction
export async function transaction<T = any>(
  queries: Array<{
    sql: string;
    params?: (string | number | boolean | null | undefined)[];
  }>
): Promise<T[][]> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const results: T[][] = [];

    for (const { sql, params } of queries) {
      const result = await client.query(sql, params);
      results.push(result.rows as T[]);
    }

    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction error:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Bulk insert helper
export async function bulkInsert(
  table: string,
  columns: string[],
  values: (string | number | boolean | null | undefined)[][]
): Promise<number> {
  if (values.length === 0) return 0;

  const placeholders = values
    .map(
      (_, i) =>
        `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(",")})`
    )
    .join(",");

  const flatValues = values.flat();
  const sql = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(",")}) VALUES ${placeholders}`;

  const result = await query(sql, flatValues);
  return result.rowCount || 0;
}

// Bulk update helper
export async function bulkUpdate(
  table: string,
  updates: Record<string, string | number | boolean | null>,
  whereIds: string[]
): Promise<number> {
  const updateClauses = Object.entries(updates)
    .map(([key], i) => `"${key}" = $${i + 1}`)
    .join(",");

  const sql = `UPDATE "${table}" SET ${updateClauses} WHERE id = ANY($${Object.keys(updates).length + 1}) RETURNING id`;

  const params = [...Object.values(updates), whereIds];
  const result = await query(sql, params);
  return result.rowCount || 0;
}

// Close pool on shutdown
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    await query("SELECT NOW()");
    return true;
  } catch {
    return false;
  }
}