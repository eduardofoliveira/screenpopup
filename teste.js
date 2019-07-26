let obj = {
  did: "11961197559",
  descricao: "Celular Eduardo",
  cpf: "402.903.648-17",
  rg: "47.186.963-6",
  numero: "186",
  complemento: "Casa 2",
  fraseologia: "Celular Oi Eduardo."
};

let campos = Object.keys(obj).filter(item => {
  return !["did", "descricao", "fraseologia"].includes(item);
});

for (let i = 0; i < campos.length; i++) {
  const key = campos[i];

  console.log(`INSERT INTO campos_agenda (${key}) values ('${obj[key]}')`);
}
