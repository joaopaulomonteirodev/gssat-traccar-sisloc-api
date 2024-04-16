import axios from "axios"
import { Agent } from "https"

const credential = Buffer.from('sisloc.telemetria:st23*').toString('base64')
const URL = 'https://zeta.sisloc.srv.br:43790/api/TEstImportarMedidorGPSDoProcess'
const agent = new Agent({
    requestCert: true,
    rejectUnauthorized: false
})

export const sendData = (body) => 
    axios.post(URL, {
        httpsAgent: agent,
        auth: {
            username: process.env.API_USERNAME,
            password: process.env.API_PASSWORD
        },
        body
    })
