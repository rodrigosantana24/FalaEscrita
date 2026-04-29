# FalaEscrita - Status atual do projeto

Este documento resume o que ja esta implementado no backend e frontend.

## 1. Visao geral

O projeto possui:

- **Backend** em Spring Boot (REST + WebSocket STOMP/SockJS)
- **Frontend** em React (SPA) com captura de audio no navegador
- **Persistencia hibrida** configurada para PostgreSQL e MongoDB

## 2. Backend implementado

### REST (HTTP)

- `POST /api/v1/auth/login`
  - Entrada (DTO): `LoginRequestDto`
  - Saida (DTO): `LoginResponseDto`
- `GET /api/v1/meetings`
  - Saida (DTO): `MeetingDto`

### WebSocket (tempo real)

- Endpoint STOMP/SockJS: `/ws/audio-stream`
- Envio de audio: `/app/chat/{meetingId}`
- Recebimento de transcricao: `/topic/transcripts/{meetingId}`

DTOs de streaming:

- `AudioChunkDto`
- `TranscriptMessageDto`

### CORS

- CORS configurado para API REST (`/api/**`)
- Origem permitida por propriedade:
  - `app.cors.allowed-origins=http://localhost:3000`
- Mesmo dominio permitido no handshake WebSocket/SockJS

## 3. Frontend implementado

SPA React em `frontend/` com:

- **Captura de midia** via `navigator.mediaDevices.getUserMedia` + Web Audio API
- **Streaming de audio** com `MediaRecorder` em chunks de **100ms**
- **Cliente WebSocket** com **SockJS + STOMP**
- **Interface reativa** que atualiza o texto conforme mensagens chegam
- **Context API** para estado global da reuniao e lista de transcricoes
- **Hooks com useState/useEffect** para status:
  - `Gravando`
  - `Pausado`
  - `Processando`

## 4. Estrutura atual do repositorio

```text
FalaEscrita/
├── backend/
│   └── src/main/java/com/falaescrita/backend/
│       ├── config/
│       ├── controller/
│       ├── dto/
│       ├── service/
│       └── websocket/
├── frontend/
│   ├── package.json
│   └── src/
│       ├── api/
│       ├── context/
│       ├── hooks/
│       ├── App.jsx
│       └── main.jsx
├── docs/
│   └── README.md
├── docker-compose.yml
└── README.md
```

## 5. Como executar localmente

### 1. Subir bancos

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## 6. Proximos passos

- Substituir transcricao simulada por mecanismo real (Whisper/OpenAI/Spring AI)
- Implementar seguranca JWT completa com Spring Security
- Persistir reunioes e transcricoes em PostgreSQL/MongoDB
