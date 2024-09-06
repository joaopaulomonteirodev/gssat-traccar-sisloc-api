import pg from 'pg'
const { Client } = pg

export const createConnection = async () => {
    const client = new Client({
        user: process.env.TRACCAR_DATABASE_USER,
        password: process.env.TRACCAR_DATABASE_PASSWORD,
        host: process.env.TRACCAR_DATABASE,
        port: process.env.TRACCAR_DATABASE_PORT,
        database: process.env.TRACCAR_DATABASE_NAME
    })
    await client.connect()
    return client
} 
