const axios = require('axios')
const fs = require('fs')
const arquivo = fs.createReadStream('./.env.example')
const FormData = require('form-data')

const api = axios.create({
  baseURL: 'https://api.netoffice.com.br/v1/'
})

let executar = async () => {
  // let response = await api.get('/GetClientes', {
  //   headers: { token: 'Aa342de6b4545610SN38d54107fsdA28c8b4d1AZ3' },
  //   params: {
  //     fone: '1140031465_'
  //   }
  // })
  // console.log(response.data)

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
    console.log(result.data)
  })
}

executar()
