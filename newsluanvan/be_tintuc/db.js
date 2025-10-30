import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306, // có thể thêm nếu muốn chắc chắn
});

export default db;
/////db.js