import mysql from 'mysql2/promise'

export const createConnection = () => mysql.createConnection({
    host: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})