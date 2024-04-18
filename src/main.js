import { createConnection } from "./conection.js"
import { sendData } from "./request.js"


try {
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

    connection.end() 

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

    const {data} = await sendData({ gps })
    console.log(data)


} catch (error) {
    console.log(error)
}
