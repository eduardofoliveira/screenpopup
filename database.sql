create table dominio(
  id bigint not null primary key auto_increment,
  dominio varchar(100) not null
);

create table usuario(
  id bigint not null primary key auto_increment,
  ativo tinyint(1) not null default 1,
  nome varchar(100) not null,
  email varchar(100) not null,
  senha varchar(100) not null,
  user_basix varchar(30) not null,
  fk_id_dominio bigint,
  tipo tinyint not null default 1,
  loginlogout tinyint not null default 2,
  gravacao tinyint not null default 1,
  descricao text,
  ativo_dendron tinyint not null default 0,
  dendron_operador varchar(255),
  dendron_token varchar(255),
  ativo_zendesk tinyint not null default 0,
  email_zendesk varchar(255),
  token_zendesk varchar(255),
  sub_dominio_zendesk varchar(255),
  foreign key (fk_id_dominio) references dominio (id)
);

create table agenda(
  id bigint not null primary key auto_increment,
  did varchar(100) not null,
  descricao varchar(100) not null,
  fraseologia varchar(2048),
  fk_id_dominio bigint,
  foreign key (fk_id_dominio) references dominio (id)
);

create table campos_agenda(
  id bigint not null primary key auto_increment,
  nome_campo varchar(100),
  conteudo varchar(255),
  fk_id_agenda bigint,
  foreign key (fk_id_agenda) references agenda (id)
);

create table template_agenda(
  id bigint not null primary key auto_increment,
  nome_campo varchar(100),
  fk_id_dominio bigint,
  foreign key (fk_id_dominio) references dominio (id)
);

create table chamado(
  id bigint not null primary key auto_increment,
  de varchar(15) not null,
  para varchar(15),
  comentario text,
  inicio timestamp default current_timestamp,
  termino timestamp default null,
  call_id varchar(50),
  fk_id_usuario bigint not null,
  fk_id_dominio bigint not null,
  aberto tinyint default 1,
  fk_fechado_por bigint,
  foreign key (fk_id_usuario) references usuario (id),
  foreign key (fk_id_dominio) references dominio (id),
  foreign key (fk_fechado_por) references usuario (id)
);

create table integracao(
  id bigint not null primary key auto_increment,
  fk_id_usuario bigint not null,
  fk_id_dominio bigint not null,
  id_ticket bigint not null default 0,
  callid varchar(255) not null,
  gravacao_enviada tinyint not null default 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  foreign key (fk_id_usuario) references usuario (id),
  foreign key (fk_id_dominio) references dominio (id)
);

insert into dominio (dominio) values ('cloud.cloudcom.com.br');
insert into usuario (nome, email, senha, user_basix, fk_id_dominio) values ('Eduardo', 'eoliveira@cloudcom.com.br', '$2b$12$X1WEjDWBb9YJoH93tE4MbuFIVwRCGwiHoCOi7VSVv.fpPT.5SEIsW', 'Eduardo', 1);
insert into usuario (nome, email, senha, user_basix, tipo) values ('admin', 'admin', '$2y$12$IPw75lsU5/sHHpghKNIDT.TFuIWXZnpeahXlVLRNrjIxTTIf7qSw6', 'admin', 3);