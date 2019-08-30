const express = require('express')
const app = express.Router()
const { abrirChamado, fecharChamado, obterDetalhesLigacao, obterHistorico } = require('../model/chamado')
const { obterContato } = require('../model/agenda')
const integracao = require('../middleware/integracaoMiddleware')

const init = () => {
  app.get('/:from/:to/:user/:domain/:callid/:event', integracao, async (req, res) => {
    res.send()

    let { conn, io } = req
    const parametros = req.params
    const { from, to, user, domain, callid, event } = req.params

    if (event === 'RINGING' || event === 'ESTABLISHED') {
      let descricoes = await obterDetalhesLigacao(from, to, user, domain, conn)

      parametros.fromComment = descricoes.desc_from ? descricoes.desc_from : ''
      parametros.toComment = descricoes.desc_to ? descricoes.desc_to : ''
      parametros.script = descricoes.script ? descricoes.script : ''
      parametros.id_from = descricoes.id_from ? descricoes.id_from : ''

      parametros.detalhes = await obterContato(descricoes.id_from, conn)

      parametros.historico = await obterHistorico(descricoes.id_dominio, from, conn)

      if (Number.isInteger(descricoes.id_usuario) && Number.isInteger(descricoes.id_dominio)) {
        parametros.id = await abrirChamado(from, to, callid, descricoes.id_usuario, descricoes.id_dominio, conn)

        io.emit(`${parametros.domain}-${parametros.user}`, parametros)
      }
    }

    if (event === 'DISCONNECTED') {
      fecharChamado(callid, conn)
      return
    }
    return
  })

  app.get('/:from/:to/:user/:domain/:callid/:event/:history', integracao, async (req, res) => {
    return res.send()
  })

  return app
}

module.exports = init
