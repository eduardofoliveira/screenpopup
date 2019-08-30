const { getDendronParams, getZendeskParams } = require('../model/usuario')
const { getClienteId, addTicket, addTicketWClient } = require('../service/api-dendron')
const { addGravacaoEmEspera } = require('../model/integracao')
const { addZenTicket } = require('../service/api-zendesk')

const middleware = async (req, res, next) => {
  const { from, to, user, domain, callid, event, history } = req.params

  if (!(event === 'RINGING' || event === 'ESTABLISHED')) {
    return next()
  }

  let { conn } = req
  let [[{ ativo_dendron, ativo_zendesk }]] = await conn.query(
    `
    SELECT
      ativo_dendron,
      ativo_zendesk
    FROM
      usuario u,
      dominio d
    WHERE
      u.fk_id_dominio = d.id and
      u.user_basix = ? and
      d.dominio = ? and
      u.ativo = 1
  `,
    [user, domain]
  )

  if (!ativo_dendron && !ativo_zendesk) {
    return next()
  }

  if (ativo_dendron) {
    let { idUser, idDominio, token, operador } = await getDendronParams(user, domain, conn)
    if (token) {
      let clienteId = await getClienteId(token, from)

      if (clienteId) {
        if (history) {
          let { id_ticket } = await addTicket(
            token,
            operador,
            history.split('.')[history.split('.').length - 1],
            history.split('.').join(' -> '),
            clienteId,
            from
          )
          addGravacaoEmEspera(idUser, idDominio, id_ticket, callid, conn)
        } else {
          let { id_ticket } = await addTicket(token, operador, 'Telefonia', '', clienteId, from)
          addGravacaoEmEspera(idUser, idDominio, id_ticket, callid, conn)
        }
      } else {
        if (history) {
          let { id_ticket } = await addTicketWClient(
            token,
            operador,
            history.split('.')[history.split('.').length - 1],
            history.split('.').join(' -> '),
            from
          )

          addGravacaoEmEspera(idUser, idDominio, id_ticket, callid, conn)
        } else {
          let { id_ticket } = await addTicketWClient(token, operador, 'Telefonia', '', from)
          addGravacaoEmEspera(idUser, idDominio, id_ticket, callid, conn)
        }
      }
    }
    return res.send()
  }

  if (ativo_zendesk) {
    let { email, token, sub_dominio } = await getZendeskParams(user, domain, conn)

    console.log(email, token, sub_dominio)
    await addZenTicket(sub_dominio, email, token, from, to)

    return res.json({ ok: '200' })
  }
}

module.exports = middleware
