const express = require("express");
const app = express.Router();
const bcrypt = require("bcryptjs");

const init = connection => {
  app.use(require("../middleware/authMiddleware"));

  app.get("/", async (req, res) => {
    let usuarios;

    if (req.session.user.tipo === 3) {
      [usuarios] = await connection.query(
        "SELECT usuario.id, ativo, nome, email, user_basix, dominio, tipo FROM usuario left join dominio on usuario.fk_id_dominio = dominio.id where usuario.id not in (1)"
      );
    } else {
      [usuarios] = await connection.query(
        "SELECT usuario.id, ativo, nome, email, user_basix, dominio FROM usuario, dominio WHERE usuario.fk_id_dominio = dominio.id and dominio.id = ?",
        [req.session.user.fk_id_dominio]
      );
    }

    res.render("usuarios", { usuarios });
  });

  app.get("/adicionar", async (req, res) => {
    if (req.session.user.tipo === 3) {
      [dominios] = await connection.query("SELECT * FROM dominio");
    } else {
      [dominios] = await connection.query("SELECT * FROM dominio where id = ?", [req.session.user.fk_id_dominio]);
    }
    let errors = null;
    let usuario = { nome: "", email: "", senha: "", senha_conf: "", dominio: "", user_basix: "" };
    res.render("usuarios-add", { dominios, errors, usuario });
  });

  app.post("/adicionar", async (req, res) => {
    const usuario = req.body;

    req.assert("user_basix", "Insira o nome do usuario do PBX").notEmpty();
    req.assert("nome", "Campo nome é obrigatório").notEmpty();
    req.assert("email", "Endereço de e-mail inválido.").isEmail();
    req.assert("senha", "A senha deve ter no minimo 8 caracteres").isLength({ min: 8 });
    req.assert("dominio", "Selecione um domínio válido").notEmpty();
    req.checkBody("senha_conf", "Confirmação de senha inválida.").equals(usuario.senha);
    req.assert("gravacao", "Selecione uma opção de gravação").notEmpty();
    req.assert("tipo", "Selecione um tipo de permissão").notEmpty();
    req.assert("loginlogout", "Selecione a opção de exibição de login e logout").notEmpty();

    let errors = req.validationErrors();

    if (errors) {
      errors = errors.map(item => {
        return { item: item.param, msg: item.msg };
      });

      if (req.session.user.tipo === 3) {
        [dominios] = await connection.query("SELECT * FROM dominio");
      } else {
        [dominios] = await connection.query("SELECT * FROM dominio where id = ?", [req.session.user.fk_id_dominio]);
      }
      res.render("usuarios-add", { dominios, errors, usuario });
      return;
    }

    usuario.senha = await bcrypt.hash(usuario.senha, 12);

    await connection.query(
      "INSERT INTO usuario (nome, email, senha, user_basix, fk_id_dominio, tipo, loginlogout, gravacao, descricao) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        usuario.nome,
        usuario.email,
        usuario.senha,
        usuario.user_basix,
        usuario.dominio,
        usuario.tipo,
        usuario.loginlogout,
        usuario.gravacao,
        usuario.descricao
      ]
    );
    res.redirect("/usuarios");
  });

  app.delete("/:id", async (req, res) => {
    const { id } = req.params;

    let [existe] = await connection.query("SELECT * FROM usuario WHERE id = ?", [id]);
    if (existe.length === 1) {
      await connection.query("DELETE FROM usuario WHERE id = ?", [id]);
      res.statusCode = 202;
      res.charset = "utf-8";
      res.json({ message: "usuário deletado com sucesso !" });
    } else {
      res.statusCode = 204;
      res.charset = "utf-8";
      res.json({ message: "usuário não encontrado, erro na deleção" });
    }
  });

  app.put("/ativar/:id", async (req, res) => {
    const { id } = req.params;

    let [existe] = await connection.query("SELECT * FROM usuario WHERE id = ?", [id]);
    if (existe.length === 1) {
      await connection.query("UPDATE usuario set ativo = 1 where id = ?", [id]);
      res.statusCode = 202;
      res.charset = "utf-8";
      res.json({ message: "usuário deletado com sucesso !" });
    } else {
      res.statusCode = 204;
      res.charset = "utf-8";
      res.json({ message: "usuário não encontrado, erro na deleção" });
    }
  });

  app.put("/desativar/:id", async (req, res) => {
    const { id } = req.params;

    let [existe] = await connection.query("SELECT * FROM usuario WHERE id = ?", [id]);
    if (existe.length === 1) {
      await connection.query("UPDATE usuario set ativo = 0 where id = ?", [id]);
      res.statusCode = 202;
      res.charset = "utf-8";
      res.json({ message: "usuário deletado com sucesso !" });
    } else {
      res.statusCode = 204;
      res.charset = "utf-8";
      res.json({ message: "usuário não encontrado, erro na deleção" });
    }
  });

  app.get("/editar/:id", async (req, res) => {
    const { id } = req.params;

    let [usuario] = await connection.query(
      "SELECT ativo, nome, user_basix, email, fk_id_dominio, tipo, loginlogout, gravacao, descricao, dendron_operador, dendron_token FROM usuario WHERE id = ?",
      [id]
    );
    if (usuario.length === 1) {
      let dominios;
      if (req.session.user.tipo === 3) {
        [dominios] = await connection.query("SELECT * FROM dominio");
      } else {
        [dominios] = await connection.query("SELECT * FROM dominio where id = ?", [req.session.user.fk_id_dominio]);
      }
      usuario = usuario[0];
      let errors = null;
      res.render("usuarios-edt", { usuario, dominios, errors });
    } else {
    }
  });

  app.post("/editar/:id", async (req, res) => {
    const { id } = req.params;
    const usuario = req.body;

    if (usuario.ativo) {
      usuario.ativo = 1;
    } else {
      usuario.ativo = 0;
    }

    req.assert("user_basix", "Insira o nome do usuario do PBX").notEmpty();
    req.assert("gravacao", "Selecione uma opção de gravação").notEmpty();
    req.assert("tipo", "Selecione um tipo de permissão").notEmpty();
    req.assert("loginlogout", "Selecione a opção de exibição de login e logout").notEmpty();
    req.assert("nome", "Campo nome é obrigatório").notEmpty();
    req.assert("email", "Endereço de e-mail inválido.").isEmail();
    req.assert("dominio", "Selecione um domínio válido").notEmpty();

    if (usuario.senha.length > 0) {
      req.assert("senha", "A senha deve ter no minimo 8 caracteres").isLength({ min: 8 });
      req.checkBody("senha_conf", "Confirmação de senha inválida.").equals(usuario.senha);
    }

    let errors = req.validationErrors();
    if (errors) {
      errors = errors.map(item => {
        return { item: item.param, msg: item.msg };
      });

      if (req.session.user.tipo === 3) {
        [dominios] = await connection.query("SELECT * FROM dominio");
      } else {
        [dominios] = await connection.query("SELECT * FROM dominio where id = ?", [req.session.user.fk_id_dominio]);
      }

      res.render("usuarios-edt", { usuario, dominios, errors });
      return;
    }

    if (req.session.user.tipo === 3) {
      if (usuario.senha.length > 0) {
        usuario.senha = await bcrypt.hash(usuario.senha, 12);
        await connection.query(
          "UPDATE usuario set ativo = ?, nome = ?, email = ?, senha = ?, user_basix = ?, loginlogout = ?, gravacao = ?, tipo = ?, descricao = ?, dendron_operador = ?, dendron_token = ?, fk_id_dominio = ? WHERE id = ?",
          [
            usuario.ativo,
            usuario.nome,
            usuario.email,
            usuario.senha,
            usuario.user_basix,
            usuario.loginlogout,
            usuario.gravacao,
            usuario.tipo,
            usuario.descricao,
            usuario.dendron_operador,
            usuario.dendron_token,
            usuario.dominio,
            id
          ]
        );
      } else {
        await connection.query(
          "UPDATE usuario set ativo = ?, nome = ?, email = ?, user_basix = ?, loginlogout = ?, gravacao = ?, tipo = ?, descricao = ?, dendron_operador = ?, dendron_token = ?, fk_id_dominio = ? WHERE id = ?",
          [
            usuario.ativo,
            usuario.nome,
            usuario.email,
            usuario.user_basix,
            usuario.loginlogout,
            usuario.gravacao,
            usuario.tipo,
            usuario.descricao,
            usuario.dendron_operador,
            usuario.dendron_token,
            usuario.dominio,
            id
          ]
        );
      }
    } else {
      if (usuario.senha.length > 0) {
        usuario.senha = await bcrypt.hash(usuario.senha, 12);
        await connection.query(
          "UPDATE usuario set ativo = ?, nome = ?, email = ?, senha = ?, user_basix = ?, loginlogout = ?, gravacao = ?, tipo = ?, descricao = ?, dendron_operador = ?, dendron_token = ? WHERE id = ? AND fk_id_dominio = ?",
          [
            usuario.ativo,
            usuario.nome,
            usuario.email,
            usuario.senha,
            usuario.user_basix,
            usuario.loginlogout,
            usuario.gravacao,
            usuario.tipo,
            usuario.descricao,
            usuario.dendron_operador,
            usuario.dendron_token,
            id,
            req.session.user.fk_id_dominio
          ]
        );
      } else {
        await connection.query(
          "UPDATE usuario set ativo = ?, nome = ?, email = ?, user_basix = ?, loginlogout = ?, gravacao = ?, tipo = ?, descricao = ?, dendron_operador = ?, dendron_token = ? WHERE id = ? AND fk_id_dominio = ?",
          [
            usuario.ativo,
            usuario.nome,
            usuario.email,
            usuario.user_basix,
            usuario.loginlogout,
            usuario.gravacao,
            usuario.tipo,
            usuario.descricao,
            usuario.dendron_operador,
            usuario.dendron_token,
            id,
            req.session.user.fk_id_dominio
          ]
        );
      }
    }

    res.redirect("/usuarios");
  });

  return app;
};

module.exports = init;
