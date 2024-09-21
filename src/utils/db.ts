import { Pool } from "pg";

type QueryResult = {
  rows: any[];
  rowCount: number;
  oid: number;
  fields: any[];
  command: string;
};

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Allows self-signed certificates, ensuring SSL
  },
});

const query = async (text: string, params: any[]): Promise<QueryResult> => {
  const result = await pool.query(text, params);

  return result as QueryResult;
};

// Close the connection pool when the module is no longer needed
const closePool = async () => {
  await pool.end();
  console.log("Database connection pool closed");
};

export { query, closePool };
