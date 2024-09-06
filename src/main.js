import { createConnection } from "./conection.js"
import { sendData } from "./request.js"

const MILISEC_TO_HOUR = 1000 * 60 * 60

const toHours = (timeinmili) => (timeinmili / MILISEC_TO_HOUR).toFixed(1)

const BR_TIME_OFFSET = 3 * 60 * 60 * 1000
const connection = await createConnection()

const { rows: results } = await connection
    .query(`SELECT p.deviceid, p.devicetime, p.attributes AS "position_data", d.attributes AS "device_data"
    FROM tc_positions p
        INNER JOIN tc_devices d ON(d.id = p.deviceid)
        INNER JOIN (
            SELECT deviceid, MAX(devicetime) AS devicetime
            FROM tc_positions
            GROUP BY deviceid
        ) m ON(p.deviceid = m.deviceid AND p.devicetime = m.devicetime) `)

const gps = results.map(
    result => ({
        devicetime: new Date(result.devicetime.getTime() - BR_TIME_OFFSET).toISOString(),
        device: JSON.parse(result.device_data),
        telemetry: JSON.parse(result.position_data)
    })
).filter(position => !!position.device.Patrimonio)
.map(position => ({
    nr_patrimonio: position.device.Patrimonio,
    dt_medicao: position.devicetime.replace('0Z', 'Z'),
    vl_medicao: toHours(position.telemetry.hours)
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
