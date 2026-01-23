import mysql from "mysql2/promise";
import { env } from "./env.js";

export const db = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testDBConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("MySQL connected successfully!");
    connection.release();
  } catch (error) {
    console.error("MySQL connection failed:", error);
    process.exit(1);
  }
};
