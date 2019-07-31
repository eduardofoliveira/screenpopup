const axios = require("axios");
const querystring = require("querystring");

const api = axios.create({
  baseURL: "https://api.netoffice.com.br/v1/"
});

const requestBody = querystring.stringify({
  usuario: "api",
  operador: "supernova.demo6@gmail.com",
  assunto: "Comercial",
  descricao: "URA Atendimento Comercial"
});

const config = {
  headers: {
    token: "Aa342de6b4545610SN38d54107fsdA28c8b4d1AZ3",
    "Content-Type": "application/x-www-form-urlencoded"
  }
};

let executar = async () => {
  response = await api.post("/AddTicket", requestBody, config);

  console.log(response);
};

executar();
