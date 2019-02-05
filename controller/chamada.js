const express = require('express')
const app = express.Router()

let lista = []

const init  = (connection, io) => {
  app.post('/locus', (req, res) => {
    let parametros = req.body

    console.log('Chegou info do ASTPP')

    if(parametros.call.evento !== 'CHANNEL_HANGUP_COMPLETE'){
      lista.push([parametros.call.callid, parametros.call])
    }

    if(parametros.call.evento === 'CHANNEL_HANGUP_COMPLETE'){
        lista.find((item, index) => {
          if(item){
            if(item[1].callid === parametros.call.callid){
              lista.splice(index, 1)
            }
          }
        })
    }

    res.send()
  })

  app.get('/:from/:to/:user/:domain/:callid/:event', async (req, res) => {
    const parametros = req.params

    console.log(parametros.domain)
    console.log(lista)

    if(parametros.domain === 'locus.brastel.com.br'){
      lista.find((item, index) => {
        if(item[1].from === parametros.from){
          parametros.to = item[1].to
        }
      })
    }

    console.log(parametros)

    if(parametros.event === 'RINGING'){
      console.log('Entou RINGING')
      let [[descricoes]] = await connection.query(`
      select
        (select descricao from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as desc_from,
        (select descricao from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as desc_to,
        (select fraseologia from agenda, dominio where did = ? and agenda.fk_id_dominio = dominio.id and dominio.dominio = ?) as script,
        (SELECT usuario.id FROM dominio, usuario WHERE usuario.fk_id_dominio = dominio.id AND dominio.dominio = ? AND usuario.user_basix = ?) AS id_usuario,
        (SELECT dominio.id FROM dominio, usuario WHERE usuario.fk_id_dominio = dominio.id AND dominio.dominio = ? AND usuario.user_basix = ?) AS id_dominio
      `, [parametros.from, parametros.domain, parametros.to, parametros.domain, parametros.to, parametros.domain, parametros.domain, parametros.user, parametros.domain, parametros.user])

      console.log(descricoes)

      parametros.fromComment = descricoes.desc_from ? descricoes.desc_from : ''
      parametros.toComment = descricoes.desc_to ? descricoes.desc_to : ''
      parametros.script = descricoes.script ? descricoes.script : ''

      if(Number.isInteger(descricoes.id_usuario) && Number.isInteger(descricoes.id_dominio)){
        let [chamado] = await connection.query('INSERT INTO chamado (de, para, call_id, fk_id_usuario, fk_id_dominio) VALUES (?, ?, ?, ?, ?)', [parametros.from, parametros.to, parametros.callid, descricoes.id_usuario, descricoes.id_dominio])
        parametros.id = chamado.insertId

        io.emit(`${parametros.domain}-${parametros.user}`, parametros)
      }

      res.send()
      return
    }
    if(parametros.event === 'DISCONNECTED'){
      console.log('Entou DISCONNECTED')
      res.send()
      connection.query('UPDATE chamado SET termino = now() WHERE call_id = ?', [parametros.callid])
      return
    }
    res.send()
  })

  return app
}

module.exports = init