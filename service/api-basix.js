const axios = require('axios')
const fs = require('fs')
const path = require('path')

const api = axios.create({
  baseURL: 'http://login.cloudcom.com.br'
})

const get_link_from_basix = callid => {
  return new Promise(async (resolve, reject) => {
    try {
      let { data } = await api.get(`/basix/webservices/recfiledownload/download/${callid}`, {
        auth: {
          username: 'eoliveira@centrex.brastel.com.br',
          password: '190790edu'
        }
      })
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

const get_gravacao = async (url, filename) => {
  const file_path = path.resolve(__dirname, '..', `${filename}.mp3`)
  const file = fs.createWriteStream(file_path)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(file)

  return new Promise((resolve, reject) => {
    file.on('finish', resolve)
    file.on('error', reject)
  })
}

module.exports = {
  get_link_from_basix,
  get_gravacao
}
