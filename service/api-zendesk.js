const querystring = require('querystring')
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')

const addZenTicket = (sub_dominio, email, token, from, to) => {
  return new Promise(async (resolve, reject) => {
    try {
      const api = axios.create({
        baseURL: `https://${sub_dominio}.zendesk.com/api/v2/`,
        auth: {
          username: `${email}/token`,
          password: token
        },
        headers: { 'Content-Type': 'application/json' }
      })

      // Buscar user pelo numero do telefone e vincular ao Ticket se existir.

      await api.post('/tickets.json', {
        ticket: {
          subject: `Chamada recebida de ${from} para ${to}`,
          comment: {
            body: 'Body da Requisição'
          },
          priority: 'urgent',
          requester: {
            locale_id: 19,
            name: from,
            phone: from,
            time_zone: 'Brasilia',
            iana_time_zone: 'America/Sao_Paulo'
          },
          tags: ['telefonia', 'Basix']
        }
      })

      resolve()
    } catch (error) {
      console.log(error.response)
      reject(error)
    }
  })
}

module.exports = {
  addZenTicket
}
