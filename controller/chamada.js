const express = require('express')
const app = express.Router()
const { getClienteId, addTicket, addTicketWClient } = require('../service/api-dendron')
const { getDendronParams } = require('../model/usuario')
const { abrirChamado, fecharChamado, obterDetalhesLigacao, obterHistorico } = require('../model/chamado')
const { obterContato } = require('../model/agenda')

const init = (connection, io) => {
  app.get('/:from/:to/:user/:domain/:callid/:event', async (req, res) => {
    res.send()
    const parametros = req.params

    if (parametros.event === 'RINGING' || parametros.event === 'ESTABLISHED') {
      let descricoes = await obterDetalhesLigacao(
        parametros.from,
        parametros.to,
        parametros.user,
        parametros.domain,
        connection
      )

      parametros.fromComment = descricoes.desc_from ? descricoes.desc_from : ''
      parametros.toComment = descricoes.desc_to ? descricoes.desc_to : ''
      parametros.script = descricoes.script ? descricoes.script : ''
      parametros.id_from = descricoes.id_from ? descricoes.id_from : ''

      parametros.detalhes = await obterContato(descricoes.id_from, connection)

      parametros.historico = await obterHistorico(descricoes.id_dominio, parametros.from, connection)

      if (Number.isInteger(descricoes.id_usuario) && Number.isInteger(descricoes.id_dominio)) {
        parametros.id = await abrirChamado(
          parametros.from,
          parametros.to,
          parametros.callid,
          descricoes.id_usuario,
          descricoes.id_dominio,
          connection
        )

        io.emit(`${parametros.domain}-${parametros.user}`, parametros)
      }
    }

    if (parametros.event === 'DISCONNECTED') {
      fecharChamado(parametros.callid, connection)
      return
    }
    return
  })

  app.get('/:from/:to/:user/:domain/:callid/:event/:history', async (req, res) => {
    res.send()

    let { from, history, user, domain } = req.params

    let { token, operador } = await getDendronParams(user, domain, connection)

    let clienteId = await getClienteId(token, from)

    if (clienteId) {
      await addTicket(
        token,
        operador,
        history.split('.')[history.split('.').length - 1],
        history.split('.').join(' -> '),
        clienteId,
        from
      )
    } else {
      await addTicketWClient(
        token,
        operador,
        history.split('.')[history.split('.').length - 1],
        history.split('.').join(' -> '),
        from
      )
    }

    /**
     * Salvar o ID do Ticket para posteriormente fazer o upload da gravação
     */

    return
  })

  return app
}

module.exports = init
