const express = require('express')
const app = express.Router()

const init  = (connection, io) => {
  app.get('/:from/:to/:user/:domain', async (req, res) => {
    const parametros = req.params

    let [fromComment] = await connection.query('SELECT descricao FROM agenda, dominio WHERE agenda.fk_id_dominio = dominio.id and did = ? and dominio.dominio = ?', [parametros.from, parametros.domain])
    if(fromComment.length === 1){
      parametros.fromComment = fromComment[0].descricao
    }else{
      parametros.fromComment = ''
    }
    
    let [to] = await connection.query('SELECT descricao, fraseologia FROM agenda, dominio WHERE agenda.fk_id_dominio = dominio.id and did = ? and dominio.dominio = ?', [parametros.to, parametros.domain])
    if(to.length === 1){
      parametros.toComment = to[0].descricao
      parametros.script = to[0].fraseologia
    }else{
      parametros.toComment = ''
      parametros.script = ''
    }

    io.emit(`${parametros.domain}-${parametros.user}`, parametros)
    res.send()

    let [[retorno]] = await connection.query('SELECT usuario.id AS id_usuario, dominio.id AS id_dominio FROM dominio, usuario WHERE usuario.fk_id_dominio = dominio.id AND dominio.dominio = ? AND usuario.user_basix = ?', [parametros.domain, parametros.user])
    connection.query('INSERT INTO chamado (de, para, fk_id_usuario, fk_id_dominio) VALUES (?, ?, ?, ?)', [parametros.from, parametros.to, retorno.id_usuario, retorno.id_dominio])
  })

  return app
}

module.exports = init