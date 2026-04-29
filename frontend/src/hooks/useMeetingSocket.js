import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export function useMeetingSocket({ meetingId, onTranscript }) {
  const [connectionStatus, setConnectionStatus] = useState("desconectado");
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const subscribeToMeeting = useCallback(
    (client, targetMeetingId) => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      subscriptionRef.current = client.subscribe(`/topic/transcripts/${targetMeetingId}`, (message) => {
        onTranscript(JSON.parse(message.body));
      });
    },
    [onTranscript]
  );

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      void clientRef.current.deactivate();
      clientRef.current = null;
    }

    setConnectionStatus("desconectado");
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current?.active) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws/audio-stream`),
      reconnectDelay: 3000
    });

    client.onConnect = () => {
      setConnectionStatus("conectado");
      subscribeToMeeting(client, meetingId);
    };

    client.onStompError = () => {
      setConnectionStatus("erro");
    };

    client.onWebSocketClose = () => {
      setConnectionStatus("desconectado");
    };

    client.onWebSocketError = () => {
      setConnectionStatus("erro");
    };

    setConnectionStatus("conectando");
    client.activate();
    clientRef.current = client;
  }, [meetingId, subscribeToMeeting]);

  const sendAudioChunk = useCallback(
    (audioChunk) => {
      const client = clientRef.current;
      if (!client?.connected) {
        return false;
      }

      client.publish({
        destination: `/app/chat/${meetingId}`,
        body: JSON.stringify(audioChunk)
      });

      return true;
    },
    [meetingId]
  );

  useEffect(() => () => disconnect(), [disconnect]);

  useEffect(() => {
    const client = clientRef.current;
    if (!client?.connected) {
      return;
    }
    subscribeToMeeting(client, meetingId);
  }, [meetingId, subscribeToMeeting]);

  return {
    connectionStatus,
    connect,
    disconnect,
    sendAudioChunk
  };
}
