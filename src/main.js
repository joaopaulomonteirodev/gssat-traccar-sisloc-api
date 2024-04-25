import { createConnection } from "./conection.js"
import { sendData } from "./request.js"


const connection = await createConnection()

const [results] = await connection
    .query(`SELECT p.deviceid, p.servertime, p.attributes AS 'position_data', d.attributes AS 'device_data'
    FROM tc_positions p
        INNER JOIN tc_devices d ON(d.id = p.deviceid)
        INNER JOIN (
            SELECT deviceid, MAX(servertime) AS servertime
            FROM tc_positions
            GROUP BY deviceid
        ) m ON(p.deviceid = m.deviceid AND p.servertime = m.servertime) `)

const gps = results.map(
    result => ({
        servertime: result.servertime,
        device: JSON.parse(result.device_data),
        telemetry: JSON.parse(result.position_data)
    })
).filter(position => !!position.device.Patrimonio)
.map(position => ({
    nr_patrimonio: position.device.Patrimonio,
    dt_medicao: position.servertime,
    vl_medicao: position.telemetry.hours

}))

const data_sent = JSON.stringify({ gps })

try {
    const { data } = await sendData({ gps })
    const response = JSON.stringify(data)

    await connection.query(`INSERT INTO SISLOCINTEGRATIONLOG (data_sent, response) VALUES('${data_sent}', '${response}')`)

} catch (error) {
    const data = (error.response?.data)  ? error.response?.data : { error: 'Something went wrong' }

    const response = JSON.stringify({
        informacao: data
    })

    await connection.query(`INSERT INTO SISLOCINTEGRATIONLOG (data_sent, response) VALUES('${data_sent}', '${response}')`)
} finally {
    connection.end()
}
