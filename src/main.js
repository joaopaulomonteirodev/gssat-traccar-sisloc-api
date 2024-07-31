import { createConnection } from "./conection.js"
import { getDevices, getPositions } from "./helper.js"
import { sendData } from "./request.js"

const BR_TIME_OFFSET = 6 * 60 * 60 * 1000
const connection = await createConnection()
const devices = await getDevices(connection)
const positions = getPositions(devices)

const gps = positions
.filter(position => position.telemetry.enginehours)
.map(
    position => ({
        devicetime: new Date(position.device_time - BR_TIME_OFFSET).toISOString(),
        device: position.patrimonio,
        telemetry: position.telemetry.enginehours / 3600,
    })
)
.map(position => ({
    nr_patrimonio: position.device,
    dt_medicao: position.devicetime,
    vl_medicao: position.telemetry.toFixed(1)
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