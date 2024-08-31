import mysql, { ResultSetHeader } from "mysql2/promise";

async function getConnection(maxAttempts = 5) {
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
  while (maxAttempts > 0) {
    try {
      return await mysql.createConnection({
        host: process.env.DB_HOST,
        port,
        password: process.env.DB_PASSWORD,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
      });
    } catch {
      maxAttempts--;
      console.log(`Connection failed. Remaining attempts: ${maxAttempts}`);
    }
  }
  throw new Error("Could not connect to database");
}

export async function getTableData<T>(
  table: string,
  options?: { connection?: mysql.Connection; where?: string }
) {
  const _connection = options?.connection || (await getConnection());
  const where = options?.where;

  const resultSetHeader = (
    await _connection.query(
      `SELECT * FROM ${table}${where ? ` WHERE ${where}` : ""}`
    )
  )[0] as T[];

  if (!options?.connection) await _connection.end();
  return resultSetHeader;
}

export async function insertTableData(
  table: string,
  cols: string,
  values: string,
  options?: { connection?: mysql.Connection }
) {
  const _connection = options?.connection || (await getConnection());

  const resultSetHeader = (
    await _connection.query(`INSERT INTO ${table} (${cols}) VALUES (${values})`)
  )[0] as ResultSetHeader;

  if (!options?.connection) await _connection.end();
  return resultSetHeader;
}

export async function editTableData(
  table: string,
  set: string,
  where: string,
  options?: { connection?: mysql.Connection }
) {
  const _connection = options?.connection || (await getConnection());

  const resultSetHeader = (
    await _connection.query(`UPDATE ${table} SET ${set} WHERE ${where}`)
  )[0] as ResultSetHeader;

  if (!options?.connection) await _connection.end();
  return resultSetHeader;
}

export async function deleteTableData(
  table: string,
  where: string,
  options?: { connection?: mysql.Connection }
) {
  const _connection = options?.connection || (await getConnection());

  const resultSetHeader = (
    await _connection.query(`DELETE FROM ${table} WHERE ${where}`)
  )[0] as ResultSetHeader;
  if (!options?.connection) await _connection.end();
  return resultSetHeader;
}
