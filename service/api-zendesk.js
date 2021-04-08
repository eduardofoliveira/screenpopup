//const querystring = require('querystring')
const axios = require("axios")
//const fs = require('fs')
//const FormData = require('form-data')

const addZenTicketCanal = async (sub_dominio, email, token, from, to, basix_user, brand_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const api = axios.create({
        baseURL: `https://${sub_dominio}.zendesk.com/api/v2/`,
        auth: {
          username: `${email}/token`,
          password: token,
        },
        headers: { "Content-Type": "application/json" },
        rejectUnauthorized: false,
      })

      let { data } = await api.get(`/users/search.json?query=${from}`)
      if (data.users.length > 0) {
        requester_id = data.users[0].id

        await api.post("/tickets.json", {
          ticket: {
            subject: `Chamada recebida de ${from}`,
            comment: {
              body: `Chamada Recebida:
  De: ${from}
  Para: ${to}
  Usuário: ${basix_user}`,
            },
            priority: "urgent",
            requester_id,
            tags: ["telefonia", "Basix"],
            brand_id,
          },
        })
      } else {
        await api.post("/tickets.json", {
          ticket: {
            subject: `Chamada recebida de ${from}`,
            comment: {
              body: `Chamada Recebida:
  De: ${from}
  Para: ${to}
  Usuário: ${basix_user}`,
            },
            priority: "urgent",
            requester: {
              locale_id: 19,
              name: from,
              phone: from,
              time_zone: "Brasilia",
              iana_time_zone: "America/Sao_Paulo",
            },
            tags: ["telefonia", "Basix"],
            brand_id,
          },
        })
      }

      resolve()
    } catch (error) {
      console.log(error.response)
      reject(error)
    }
  })
}

const addZenTicket = (sub_dominio, email, token, from, to, basix_user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const api = axios.create({
        baseURL: `https://${sub_dominio}.zendesk.com/api/v2/`,
        auth: {
          username: `${email}/token`,
          password: token,
        },
        headers: { "Content-Type": "application/json" },
      })

      let { data } = await api.get(`/users/search.json?query=${from}`)
      if (data.users.length > 0) {
        requester_id = data.users[0].id

        await api.post("/tickets.json", {
          ticket: {
            subject: `Chamada recebida de ${from}`,
            comment: {
              body: `Chamada Recebida:
De: ${from}
Para: ${to}
Usuário: ${basix_user}`,
            },
            priority: "urgent",
            requester_id,
            tags: ["telefonia", "Basix"],
          },
        })
      } else {
        await api.post("/tickets.json", {
          ticket: {
            subject: `Chamada recebida de ${from}`,
            comment: {
              body: `Chamada Recebida:
De: ${from}
Para: ${to}
Usuário: ${basix_user}`,
            },
            priority: "urgent",
            requester: {
              locale_id: 19,
              name: from,
              phone: from,
              time_zone: "Brasilia",
              iana_time_zone: "America/Sao_Paulo",
            },
            tags: ["telefonia", "Basix"],
          },
        })
      }

      resolve()
    } catch (error) {
      console.log(error.response)
      reject(error)
    }
  })
}

module.exports = {
  addZenTicketCanal,
  addZenTicket,
}
