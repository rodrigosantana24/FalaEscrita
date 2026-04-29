import { useMemo, useState } from "react";
import { fetchMeetings, login } from "./api/httpClient";
import { useMeeting } from "./context/MeetingContext";
import { RecordingStatus, useAudioCapture } from "./hooks/useAudioCapture";
import { useMeetingSocket } from "./hooks/useMeetingSocket";

function App() {
  const { meetingId, setMeetingId, transcripts, addTranscript, clearTranscripts } = useMeeting();
  const [username, setUsername] = useState("rodrigo");
  const [password, setPassword] = useState("123456");
  const [token, setToken] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [feedback, setFeedback] = useState("");

  const { connectionStatus, connect, disconnect, sendAudioChunk } = useMeetingSocket({
    meetingId,
    onTranscript: addTranscript
  });

  const { status, hasActiveSession, startRecording, pauseRecording, resumeRecording, stopRecording } = useAudioCapture({
    meetingId,
    onChunk: (chunk) => {
      const sent = sendAudioChunk(chunk);
      if (!sent) {
        setFeedback("WebSocket desconectado. Conecte antes de gravar.");
      }
    }
  });

  const canStart = connectionStatus === "conectado" && status === RecordingStatus.PAUSADO && !hasActiveSession;
  const canPause = status === RecordingStatus.GRAVANDO;
  const canResume = status === RecordingStatus.PAUSADO && hasActiveSession;
  const canStop = hasActiveSession && (status === RecordingStatus.GRAVANDO || status === RecordingStatus.PAUSADO);

  const transcriptCount = useMemo(() => transcripts.length, [transcripts.length]);

  async function handleLogin() {
    try {
      const response = await login(username, password);
      setToken(response.token);
      setFeedback("Autenticado com sucesso.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Falha ao autenticar.");
    }
  }

  async function handleMeetingsLoad() {
    try {
      const response = await fetchMeetings();
      setMeetings(response);
      setFeedback("Reunioes carregadas.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Falha ao carregar reunioes.");
    }
  }

  async function handleStartRecording() {
    if (connectionStatus !== "conectado") {
      setFeedback("Conecte o WebSocket antes de iniciar a gravacao.");
      return;
    }
    try {
      await startRecording();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Falha ao iniciar gravacao.");
    }
  }

  return (
    <main className="container">
      <h1>FalaEscrita</h1>

      <section className="card">
        <h2>HTTP (REST)</h2>
        <div className="row">
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Usuario" />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha"
            type="password"
          />
          <button onClick={handleLogin}>POST /login</button>
          <button onClick={handleMeetingsLoad}>GET /meetings</button>
        </div>
        <p className="small-text">Token: {token || "nao autenticado"}</p>
        {meetings.length > 0 && (
          <div className="meeting-list">
            {meetings.map((meeting) => (
              <button key={meeting.id} onClick={() => setMeetingId(meeting.id)}>
                {meeting.title} ({meeting.id})
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>WebSocket (WSS/STOMP)</h2>
        <div className="row">
          <input
            value={meetingId}
            onChange={(event) => setMeetingId(event.target.value)}
            placeholder="meetingId"
            aria-label="meetingId"
          />
          <button onClick={connect}>Conectar WS</button>
          <button onClick={disconnect}>Desconectar WS</button>
        </div>
        <p className="small-text">Status do WebSocket: {connectionStatus}</p>
      </section>

      <section className="card">
        <h2>Captura de Midia (Web Audio API + chunks 100ms)</h2>
        <div className="row">
          <button disabled={!canStart} onClick={handleStartRecording}>
            Iniciar
          </button>
          <button disabled={!canPause} onClick={pauseRecording}>
            Pausar
          </button>
          <button disabled={!canResume} onClick={resumeRecording}>
            Retomar
          </button>
          <button disabled={!canStop} onClick={stopRecording}>
            Finalizar
          </button>
          <button
            onClick={() => {
              clearTranscripts();
              setFeedback("Transcricoes limpas.");
            }}
          >
            Limpar Transcricao
          </button>
        </div>
        <p className="small-text">Status da gravacao: {status}</p>
      </section>

      <section className="card">
        <h2>Transcricao em tempo real</h2>
        <p className="small-text">Frases recebidas: {transcriptCount}</p>
        <div className="transcript-list">
          {transcripts.map((item) => (
            <article key={`${item.sequence}-${item.emittedAt}`} className="transcript-item">
              <p className="small-text">
                #{item.sequence} | {item.partial ? "Parcial" : "Final"} | {item.emittedAt}
              </p>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="feedback">{feedback}</p>
    </main>
  );
}

export default App;
