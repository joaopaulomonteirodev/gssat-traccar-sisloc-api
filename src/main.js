import { createConnection } from "./conection.js"
import { getDevices, getPositions, getTelemetryValue } from "./helper.js"
import { sendData } from "./request.js"

const BR_TIME_OFFSET = 3 * 60 * 60 * 1000
const connection = await createConnection()

const devices = await getDevices(connection)
const positions = await getPositions(devices, connection)

const gps = positions.map(
    position => ({
        devicetime: new Date(position.device_time.getTime() - BR_TIME_OFFSET).toISOString(),
        device: position.patrimonio,
        telemetry: getTelemetryValue(position),
    })
).filter(position => !!position.telemetry)
.map(position => ({
    nr_patrimonio: position.device,
    dt_medicao: position.devicetime.replace('0Z', 'Z'),
    vl_medicao: position.telemetry
}))

const data_sent = JSON.stringify({ gps })

try {
    const { data } = await sendData({ gps })
    const response = JSON.stringify(data)

    await connection.query(`INSERT INTO sislocintegrationlog (data_sent, response) VALUES('${data_sent}', '${response}')`)

} catch (error) {
    const data = (error.response?.data)  ? error.response?.data : { error: 'Something went wrong' }

    const response = JSON.stringify({
        informacao: data
    })

    await connection.query(`INSERT INTO sislocintegrationlog (data_sent, response) VALUES('${data_sent}', '${response}')`)
} finally {
    connection.end()
}
