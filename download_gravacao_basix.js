require('dotenv').config()
const { get_link_from_basix, get_gravacao } = require('./service/api-basix')
const { upload_to_ticket } = require('./service/api-dendron')

let executar = async () => {
  const conn = await require('./service/mysql')

  let [calls] = await conn.query(`
    SELECT
      i.id_ticket,
      i.callid,
      u.dendron_operador,
      u.dendron_token
    FROM
      integracao i,
      usuario u
    WHERE
      i.fk_id_usuario = u.id and
      i.gravacao_enviada = 0
  `)

  for (let i = 0; i < calls.length; i++) {
    try {
      let call = calls[i]
      let link = await get_link_from_basix(call.callid)
      await get_gravacao(link, call.callid)
      await upload_to_ticket(call.dendron_operador, 'Gravação da Chamada', call.id_ticket, `${call.callid}.mp3`)
      await conn.query('UPDATE integracao SET gravacao_enviada = 1 WHERE callid = ?', [call.callid])
    } catch (error) {
      console.log(call)
      console.log(error)
    }
  }

  process.exit(0)
}

executar()
