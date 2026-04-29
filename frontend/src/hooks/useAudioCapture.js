import { useCallback, useEffect, useRef, useState } from "react";

export const RecordingStatus = {
  GRAVANDO: "Gravando",
  PAUSADO: "Pausado",
  PROCESSANDO: "Processando"
};

const CHUNK_INTERVAL_MS = 100;
const MIME_TYPE_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function resolveMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }
  return MIME_TYPE_CANDIDATES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Falha ao converter audio para base64."));
        return;
      }
      resolve(reader.result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Falha ao ler trecho de audio."));
    reader.readAsDataURL(blob);
  });
}

export function useAudioCapture({ meetingId, onChunk }) {
  const [status, setStatus] = useState(RecordingStatus.PAUSADO);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioNodeRef = useRef(null);
  const sequenceRef = useRef(0);

  const clearMediaResources = useCallback(async () => {
    if (audioNodeRef.current) {
      audioNodeRef.current.disconnect();
      audioNodeRef.current = null;
    }

    if (audioContextRef.current) {
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context.state !== "closed") {
        await context.close();
      }
    }

    if (streamRef.current) {
      const stream = streamRef.current;
      streamRef.current = null;
      stream.getTracks().forEach((track) => track.stop());
    }

    mediaRecorderRef.current = null;
  }, []);

  const emitChunk = useCallback(
    async (blob, mimeType) => {
      const audioBase64 = await blobToBase64(blob);
      onChunk({
        meetingId,
        sequence: sequenceRef.current,
        mimeType,
        audioBase64,
        capturedAt: new Date().toISOString()
      });
      sequenceRef.current += 1;
    },
    [meetingId, onChunk]
  );

  const startRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    streamRef.current = stream;
    audioContextRef.current = audioContext;
    audioNodeRef.current = source;
    sequenceRef.current = 0;

    const mimeType = resolveMimeType();
    const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) {
        return;
      }
      void emitChunk(event.data, event.data.type || mimeType || "audio/webm");
    };

    mediaRecorder.onstart = () => {
      setStatus(RecordingStatus.GRAVANDO);
    };

    mediaRecorder.onpause = () => {
      setStatus(RecordingStatus.PAUSADO);
    };

    mediaRecorder.onresume = () => {
      setStatus(RecordingStatus.GRAVANDO);
    };

    mediaRecorder.onstop = () => {
      setStatus(RecordingStatus.PROCESSANDO);
    };

    mediaRecorderRef.current = mediaRecorder;
    setHasActiveSession(true);
    mediaRecorder.start(CHUNK_INTERVAL_MS);
  }, [emitChunk]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    if (status !== RecordingStatus.PROCESSANDO) {
      return;
    }

    let isMounted = true;
    const finishProcessing = async () => {
      await clearMediaResources();
      if (isMounted) {
        setHasActiveSession(false);
        setStatus(RecordingStatus.PAUSADO);
      }
    };

    void finishProcessing();
    return () => {
      isMounted = false;
    };
  }, [status, clearMediaResources]);

  useEffect(() => () => {
    void clearMediaResources();
  }, [clearMediaResources]);

  return {
    status,
    hasActiveSession,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording
  };
}
