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
  foreign key (fk_id_dominio) references dominio (id)
);

create table agenda(
  id bigint not null primary key auto_increment,
  did varchar(15) not null,
  descricao varchar(100) not null,
  fraseologia varchar(2048),
  fk_id_dominio bigint,
  foreign key (fk_id_dominio) references dominio (id)
);

insert into dominio (dominio) values ('cloud.cloudcom.com.br');
insert into usuario (nome, email, senha, user_basix, fk_id_dominio) values ('Eduardo', 'eoliveira@cloudcom.com.br', '$2b$12$X1WEjDWBb9YJoH93tE4MbuFIVwRCGwiHoCOi7VSVv.fpPT.5SEIsW', 'Eduardo', 1);
insert into usuario (nome, email, senha, user_basix, tipo) values ('admin', 'admin', '$2y$12$IPw75lsU5/sHHpghKNIDT.TFuIWXZnpeahXlVLRNrjIxTTIf7qSw6', 'admin', 3);