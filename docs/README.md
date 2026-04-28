# FalaEscrita - Status atual do projeto

Este documento resume, de forma objetiva, tudo o que foi implementado ate agora no sistema.

## 1. Visao geral

O projeto esta estruturado com backend em Spring Boot e persistencia hibrida:

- **PostgreSQL** para dados relacionais
- **MongoDB** para dados de documentos

O backend ja sobe com sucesso e conecta nos dois bancos via Docker Compose.

## 2. O que ja foi feito

1. Projeto backend Spring Boot criado em `backend/`.
2. Build com Maven configurado (Java 21, empacotamento `jar`).
3. Dependencias base adicionadas:
   - `spring-boot-starter-web`
   - `spring-boot-starter-websocket`
   - `spring-boot-starter-data-jpa`
   - `postgresql` (runtime)
   - `spring-boot-starter-data-mongodb`
   - `lombok`
   - `spring-boot-starter-test`
4. Classe principal da aplicacao criada (`FalaEscritaApplication`).
5. Teste inicial de contexto criado (`FalaEscritaApplicationTests`).
6. Configuracoes de conexao com PostgreSQL e MongoDB em `application.properties`.
7. Arquivo `docker-compose.yml` criado na raiz com os dois bancos.
8. Conexao dos dois bancos validada com a aplicacao em execucao.

## 3. Estrutura atual do repositorio

```text
FalaEscrita/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/falaescrita/backend/FalaEscritaApplication.java
│       │   └── resources/application.properties
│       └── test/
│           └── java/com/falaescrita/backend/FalaEscritaApplicationTests.java
├── docs/
│   └── README.md
├── docker-compose.yml
├── README.md
└── LICENSE
```

## 4. Banco de dados com Docker Compose

Arquivo: `docker-compose.yml` (na raiz)

Servicos configurados:

- **PostgreSQL**
  - container: `streaming_postgres`
  - porta: `5432`
  - database: `streaming_db`
  - user/password: `admin` / `adminpassword`
- **MongoDB**
  - container: `streaming_mongo`
  - porta: `27017`
  - user/password: `admin` / `adminpassword`

Comando para subir os bancos:

```bash
docker compose up -d
```

Comando para verificar:

```bash
docker compose ps
```

## 5. Configuracao da aplicacao (Spring)

Arquivo: `backend/src/main/resources/application.properties`

```properties
spring.application.name=falaescrita-backend

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/streaming_db
spring.datasource.username=admin
spring.datasource.password=adminpassword
spring.jpa.hibernate.ddl-auto=update

# MongoDB
spring.data.mongodb.uri=mongodb://admin:adminpassword@localhost:27017/streaming_mongo?authSource=admin
```

## 6. Evidencias de conexao concluida

Durante a inicializacao do backend, foram confirmados:

- `HikariPool-1 - Start completed.`
- `Added connection org.postgresql.jdbc.PgConnection...`
- `Monitor thread successfully connected to server ... localhost:27017`
- `Started FalaEscritaApplication ...`

Isso confirma conexao ativa com PostgreSQL e MongoDB no ambiente local.

## 7. Estado atual do sistema

Implementado ate o momento:

- base tecnica do backend
- configuracao de persistencia hibrida
- infraestrutura local de bancos via Docker
- aplicacao inicializando e conectando corretamente

Ainda nao implementado (proximas etapas):

- modulos de dominio (`controller`, `service`, `repository`, `model`)
- seguranca (JWT)
- fluxos de negocio (reunioes, transcricao, historico)
- endpoints REST e canais WebSocket do produto final

