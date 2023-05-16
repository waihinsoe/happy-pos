import { Pool } from "pg";

export const pool = new Pool({
  host: "0.0.0.0",
  user: "postgres",
  password: "waihinsoe",
  database: "my_test_db",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
