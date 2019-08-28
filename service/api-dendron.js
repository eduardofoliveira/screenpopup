const querystring = require('querystring')
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')

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

let upload_to_ticket = async (usuario, comentario, id_ticket, nome_arquivo) => {
  return new Promise((resolve, reject) => {
    try {
      const arquivo = fs.createReadStream(`./${nome_arquivo}`)

      const form = new FormData()
      form.append('usuario', usuario)
      form.append('comentario', comentario)
      form.append('id', id_ticket)
      form.append('arquivo', arquivo)

      api({
        method: 'POST',
        url: '/TicketInteracao',
        data: form,
        headers: { ...form.getHeaders(), ...{ token: 'Aa342de6b4545610SN38d54107fsdA28c8b4d1AZ3' } }
      }).then(result => {
        resolve(result.data)
        fs.unlinkSync(`./${nome_arquivo}`)
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  addTicketWClient,
  getClienteId,
  addTicket,
  upload_to_ticket
}
