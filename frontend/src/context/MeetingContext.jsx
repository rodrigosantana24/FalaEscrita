import { createContext, useCallback, useContext, useMemo, useState } from "react";

const MeetingContext = createContext(undefined);

export function MeetingProvider({ children }) {
  const [meetingId, setMeetingId] = useState("meeting-003");
  const [transcripts, setTranscripts] = useState([]);

  const addTranscript = useCallback((transcript) => {
    setTranscripts((current) => [...current, transcript]);
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  const value = useMemo(
    () => ({
      meetingId,
      setMeetingId,
      transcripts,
      addTranscript,
      clearTranscripts
    }),
    [meetingId, transcripts, addTranscript, clearTranscripts]
  );

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeeting deve ser usado dentro de MeetingProvider.");
  }
  return context;
}
