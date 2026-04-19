
---
# FalaEscrita 🎙️

O **FalaEscrita** é um sistema inteligente de reconhecimento e processamento de fala em tempo real. Desenvolvido com foco em produtividade, o sistema captura, transcreve e traduz conversas, sendo a ferramenta ideal para reuniões. 

---

## Tecnologias
    
* **Linguagem:** Java 17+
* **Framework Backend:** Spring Boot 3+
* **Framework Frontend:** React + Web Audio API
* **Segurança:** Spring Security + JWT (JSON Web Token)
* **Banco de Dados Relacional:** PostGreSQL (Gestão de usuários, metadados de reuniões e permissões)
* **Banco de Dados NoSQL:** MongoDB (Armazenamento de transcrições massivas e logs de conversa)
* **Comunicação em Tempo Real:** WebSockets (STOMP)
* **Inteligência Artificial:** Spring AI (Integração com Whisper/OpenAI para Speech-to-Text)

---

## Funcionalidades
* **Transcrição em Tempo Real:** Processamento de áudio via streaming com conversão imediata para texto.
* **Geração Automática de Atas:** Utilização de IA para ler a transcrição completa e gerar resumos e listas de tarefas (To-do lists) ao final da reunião.
* **Tradução Simultânea:** Suporte para tradução de conversas prescritas em múltiplos idiomas.
* **Persistência Híbrida:** Arquitetura otimizada que separa dados transacionais rápidos (PostgreSQL) do grande volume de texto gerado pelas falas (MongoDB).
* **Autenticação Segura:** Acesso às salas de reunião protegido via tokens JWT.

---

## Arquitetura e Estrutura
O sistema utiliza uma arquitetura baseada em eventos para o fluxo de áudio, combinada com o padrão **MVC (Model-View-Controller)** para as operações REST.

A estrutura do Backend é dividida em camadas para garantir alta coesão e manutenibilidade:

```text
src/main/java/com/falaescrita/
├── controller/    # Endpoints REST (Auth, Histórico)
├── websocket/     # Handlers e configurações de WebSockets para streaming
├── service/       # Lógica de negócio, processamento assíncrono e IA
├── model/         # Entidades (JPA/PostgreSQL e Documentos/MongoDB)
├── repository/    # Interfaces de persistência (Dual Database)
├── dto/           # Objetos de transferência de dados (JSON e STOMP)
├── ai/            # Integração com APIs externas de transcrição/tradução
└── security/      # Configurações de acesso e filtros JWT
```

---

## Principais Endpoints

|Protocolo | Método | Endpoint | Descrição |
| --- | --- | --- | --- |
|**REST**| `POST` | `/api/v1/auth/login` | Autenticação e geração de Token JWT |
|**REST**| `POST` | `/api/v1/meetings` | Cria uma nova sala de reunião |
|**WSS**| `CONNECT` | `/ws/audio-stream` | Handshake do WebSocket para iniciar |envio contínuo |
|**WSS**| `SEND` | `/app/chat/{meetingId}` | Canal de envio dos fragmentos (blobs) de áudio |
|**WSS**| `SUBSCRIBE` | `/topic/transcripts/{id}` | Canal onde o React recebe o    texto transcrito em tempo real |

---

## 👤 Autor

### **Rodrigo Santana**  

Estagiário de Desenvolvimento Backend | Estudante de Sistemas de Informação (UFRPE)
<br></br>**LinkedIn:** [linkedin.com/in/rodrigo-santana24/](https://www.linkedin.com/in/rodrigo-santana24/)
---

