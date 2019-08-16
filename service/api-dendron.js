const querystring = require('querystring')
const axios = require('axios')

const api = axios.create({
  baseURL: 'https://api.netoffice.com.br/v1/'
})

let getClienteId = (token, fone) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.get('/GetClientes', {
        headers: { token },
        params: { fone }
      })

      if (response.data) {
        let clienteId = response.data.reduce((retorno, item) => {
          if (item.telefone1) {
            if (item.telefone1.replace(/\(|\)| |-/g, '') === from) {
              retorno = item.id
            }
          }
          if (item.telefone2) {
            if (item.telefone2.replace(/\(|\)| |-/g, '') === from) {
              retorno = item.id
            }
          }

          return retorno
        })

        resolve(clienteId.id)
      }
      resolve(null)
    } catch (error) {
      reject(error)
    }
  })
}

let addTicket = (token, operador, assunto, descricao, clientId, from) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await api.post(
        '/AddTicket',
        querystring.stringify({
          usuario: 'api',
          operador,
          tags: `telefonia, ${from}`,
          assunto,
          descricao,
          cliente_id: clientId
        }),
        {
          headers: {
            token,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      resolve(response.data)
    } catch (error) {
      reject(error)
    }
  })
}

let addTicketWClient = (token, operador, assunto, descricao, from) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await api.post(
        '/AddTicket',
        querystring.stringify({
          usuario: 'api',
          operador,
          tags: `telefonia, ${from}`,
          assunto,
          descricao
        }),
        {
          headers: {
            token,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      resolve(response.data)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  addTicketWClient,
  getClienteId,
  addTicket
}
