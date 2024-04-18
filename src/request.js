import axios from "axios"

const username = process.env.API_USERNAME
const password = process.env.API_PASSWORD
const credential = Buffer.from(`${username}:${password}`).toString('base64')
const URL = 'https://zeta.sisloc.srv.br:43790/api/TEstImportarMedidorGPSDoProcess'

export const sendData = (body) =>
    axios.post(URL, body, { 
        auth: {
            username,
            password
        }
    },
)
