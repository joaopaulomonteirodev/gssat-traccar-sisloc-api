export async function getDevices(connection) {
    const [devices] = await connection
    .query(`SELECT d.id, d.patrimonio, d.traccar_device_id AS traccar_id, s.id as sensor_id, s.unit_of_measurement as unit
            FROM hypegps_web.devices d 
	            INNER JOIN hypegps_web.device_sensors s ON (s.device_id = d.id)
            WHERE patrimonio IS NOT NULL AND patrimonio <> '' AND s.type = 'engine_hours' `)

    return devices
}

function buildPositionQuery(devices) {
    const queries = devices.map(device => `
        SELECT p.device_time, p.sensors_values, ${device.sensor_id} as sensor_id,
                ${device.traccar_id} AS traccar_id, '${device.patrimonio}' AS patrimonio,
                '${device.unit}' AS unit
        FROM positions_${device.traccar_id} p
            INNER JOIN (
                SELECT device_id, max(device_time) AS device_time
                FROM positions_${device.traccar_id}
                GROUP BY device_id
            ) m ON (p.device_time = m.device_time)
        `)

    return queries.join('\nUNION\n')
}

export async function getPositions(devices, connection) {
    const sql = buildPositionQuery(devices)
    const [positions] = await connection
    .query(sql)
    return positions
}

export function getTelemetryValue({sensors_values, sensor_id, unit}) {
    const valuesList = JSON.parse(JSON.parse(sensors_values))
    const telemetry = valuesList.find(sensor => sensor.id === sensor_id)
    const val = telemetry.val

    if(unit === 'h') {
        return val * 60 * 60 * 1000
    }

    if (unit === 'm') {
        return val * 60 * 1000
    }

    if( unit === 's') {
        return val * 1000
    }

    return val
}