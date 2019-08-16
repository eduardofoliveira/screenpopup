const express = require('express')
const app = express.Router()
const { getClienteId, addTicket, addTicketWClient } = require('../service/api-dendron')
const { getDendronParams } = require('../model/usuario')
const { abrirChamado, fecharChamado, obterDetalhesLigacao, obterHistorico } = require('../model/chamado')
const { obterContato } = require('../model/agenda')
const { addGravacaoEmEspera } = require('../model/integracao')

const init = (connection, io) => {
  app.get('/:from/:to/:user/:domain/:callid/:event', async (req, res) => {
    res.send()
    const parametros = req.params
    const { from, to, user, domain, callid, event } = req.params

    if (event === 'RINGING' || event === 'ESTABLISHED') {
      let descricoes = await obterDetalhesLigacao(from, to, user, domain, connection)

      let { idUser, idDominio, token, operador } = await getDendronParams(user, domain, connection)
      if (token) {
        let clienteId = await getClienteId(token, from)

        if (clienteId) {
          let { id_ticket } = await addTicket(token, operador, 'Telefonia', '', clienteId, from)

          addGravacaoEmEspera(idUser, idDominio, id_ticket, callid, connection)
        } else {
          let { id_ticket } = await addTicketWClient(token, operador, 'Telefonia', '', from)

          addGravacaoEmEspera(idUser, idDominio, id_ticket, callid, connection)
        }

        return
      }

      parametros.fromComment = descricoes.desc_from ? descricoes.desc_from : ''
      parametros.toComment = descricoes.desc_to ? descricoes.desc_to : ''
      parametros.script = descricoes.script ? descricoes.script : ''
      parametros.id_from = descricoes.id_from ? descricoes.id_from : ''

      parametros.detalhes = await obterContato(descricoes.id_from, connection)

      parametros.historico = await obterHistorico(descricoes.id_dominio, from, connection)

      if (Number.isInteger(descricoes.id_usuario) && Number.isInteger(descricoes.id_dominio)) {
        parametros.id = await abrirChamado(from, to, callid, descricoes.id_usuario, descricoes.id_dominio, connection)

        io.emit(`${parametros.domain}-${parametros.user}`, parametros)
      }
    }

    if (event === 'DISCONNECTED') {
      fecharChamado(callid, connection)
      return
    }
    return
  })

  app.get('/:from/:to/:user/:domain/:callid/:event/:history', async (req, res) => {
    res.send()

    let { from, history, user, domain, callid } = req.params

    let { idUser, idDominio, token, operador } = await getDendronParams(user, domain, connection)

    let clienteId = await getClienteId(token, from)

    if (clienteId) {
      let { id_ticket } = await addTicket(
        token,
        operador,
        history.split('.')[history.split('.').length - 1],
        history.split('.').join(' -> '),
        clienteId,
        from
      )

      addGravacaoEmEspera(idUser, idDominio, id_ticket, callid, connection)
    } else {
      let { id_ticket } = await addTicketWClient(
        token,
        operador,
        history.split('.')[history.split('.').length - 1],
        history.split('.').join(' -> '),
        from
      )

      addGravacaoEmEspera(idUser, idDominio, id_ticket, callid, connection)
    }

    return
  })

  return app
}

module.exports = init
