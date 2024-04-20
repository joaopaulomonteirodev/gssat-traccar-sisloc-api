import mysql from 'mysql2/promise'

export const createConnection = () => mysql.createConnection({
    host: process.env.TRACCAR_DATABASE,
    port: process.env.TRACCAR_DATABASE_PORT,
    user: process.env.TRACCAR_DATABASE_USER,
    password: process.env.TRACCAR_DATABASE_PASSWORD,
    database: process.env.TRACCAR_DATABASE_NAME
})
