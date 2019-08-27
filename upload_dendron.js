const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')

const api = axios.create({
  baseURL: 'https://api.netoffice.com.br/v1/'
})

let upload_to_ticket = async (usuario, comentario, id_ticket, arquivo) => {
  return new Promise((resolve, reject) => {
    try {
      const arquivo = fs.createReadStream(`./${arquivo}`)

      const form = new FormData()
      form.append('usuario', 'supernova.demo6@gmail.com')
      form.append('comentario', 'Add Gravação - 2')
      form.append('id', '1857')
      form.append('arquivo', arquivo)

      api({
        method: 'POST',
        url: '/TicketInteracao',
        data: form,
        headers: { ...form.getHeaders(), ...{ token: 'Aa342de6b4545610SN38d54107fsdA28c8b4d1AZ3' } }
      }).then(result => {
        resolve(result.data)
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  upload_to_ticket
}
