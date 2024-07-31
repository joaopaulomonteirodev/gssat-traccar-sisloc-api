import { XMLParser } from 'fast-xml-parser';

export async function getDevices(connection) {
    const [devices] = await connection
        .query(`SELECT d.patrimonio, td.device_time, td.other
            FROM hypegps_web.devices d 
                INNER JOIN hypegps_traccar.devices td ON (td.id = d.traccar_device_id)
            WHERE patrimonio IS NOT NULL AND patrimonio <> '' `)

    return devices
}

export function getPositions(devices) {
    const parser = new XMLParser()
    return devices.map(device => ({
        ...device,
        device_time: new Date(device.device_time).getTime(),
        telemetry: parser.parse(device.other).info
    }))
}