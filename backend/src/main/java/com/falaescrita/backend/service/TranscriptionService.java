package com.falaescrita.backend.service;

import com.falaescrita.backend.dto.AudioChunkDto;
import com.falaescrita.backend.dto.TranscriptMessageDto;
import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class TranscriptionService {

    private final Map<String, MeetingTranscriptionState> stateByMeeting = new ConcurrentHashMap<>();
    private final RestClient restClient;
    private final String model;
    private final String language;
    private final int minBatchBytes;
    private final long maxBatchMillis;
    private final boolean openAiEnabled;

    public TranscriptionService(
            @Value("${app.transcription.openai.api-key:${OPENAI_API_KEY:}}") String apiKey,
            @Value("${app.transcription.openai.base-url:https://api.openai.com}") String baseUrl,
            @Value("${app.transcription.openai.model:whisper-1}") String model,
            @Value("${app.transcription.openai.language:pt}") String language,
            @Value("${app.transcription.min-batch-bytes:12000}") int minBatchBytes,
            @Value("${app.transcription.max-batch-millis:2500}") long maxBatchMillis
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
        this.model = model;
        this.language = language;
        this.minBatchBytes = minBatchBytes;
        this.maxBatchMillis = maxBatchMillis;
        this.openAiEnabled = apiKey != null && !apiKey.isBlank();
    }

    public TranscriptMessageDto transcribe(String meetingId, AudioChunkDto chunk) {
        String resolvedMeetingId = resolveMeetingId(meetingId, chunk);
        byte[] chunkBytes = decodeAudio(chunk.audioBase64());
        Instant capturedAt = chunk.capturedAt() != null ? chunk.capturedAt() : Instant.now();

        MeetingTranscriptionState state = stateByMeeting.computeIfAbsent(resolvedMeetingId, ignored -> new MeetingTranscriptionState());

        byte[] audioBatch = null;
        synchronized (state) {
            if (state.windowStart == null) {
                state.windowStart = capturedAt;
            }

            state.audioBuffer.writeBytes(chunkBytes);
            long windowMs = Duration.between(state.windowStart, capturedAt).toMillis();
            boolean reachedThreshold = state.audioBuffer.size() >= minBatchBytes || windowMs >= maxBatchMillis;

            if (reachedThreshold) {
                audioBatch = state.audioBuffer.toByteArray();
                state.audioBuffer.reset();
                state.windowStart = null;
            }
        }

        if (audioBatch == null || audioBatch.length == 0) {
            return null;
        }

        String transcriptText = normalizeTranscript(transcribeWithOpenAi(audioBatch, chunk.mimeType()));
        if (transcriptText == null) {
            return null;
        }

        synchronized (state) {
            if (transcriptText.equals(state.lastTranscriptText)) {
                return null;
            }
            state.lastTranscriptText = transcriptText;
            long outputSequence = state.outputSequence.incrementAndGet();
            return new TranscriptMessageDto(
                    resolvedMeetingId,
                    outputSequence,
                    true,
                    transcriptText,
                    Instant.now()
            );
        }
    }

    private String resolveMeetingId(String meetingId, AudioChunkDto chunk) {
        if (chunk.meetingId() != null && !chunk.meetingId().isBlank()) {
            return chunk.meetingId();
        }
        if (meetingId == null || meetingId.isBlank()) {
            throw new IllegalArgumentException("meetingId nao pode ser vazio.");
        }
        return meetingId;
    }

    private byte[] decodeAudio(String audioBase64) {
        if (audioBase64 == null || audioBase64.isBlank()) {
            throw new IllegalArgumentException("audioBase64 nao pode ser vazio.");
        }
        try {
            return Base64.getDecoder().decode(audioBase64);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("audioBase64 invalido.", ex);
        }
    }

    private String transcribeWithOpenAi(byte[] audioBatch, String mimeType) {
        if (!openAiEnabled) {
            throw new IllegalStateException(
                    "OPENAI_API_KEY nao configurada. Defina a variavel de ambiente para habilitar a transcricao real."
            );
        }

        MultiValueMap<String, Object> payload = new LinkedMultiValueMap<>();
        payload.add("model", model);
        if (language != null && !language.isBlank()) {
            payload.add("language", language);
        }
        payload.add("response_format", "text");
        payload.add("file", new NamedByteArrayResource(audioBatch, "chunk" + resolveFileExtension(mimeType)));

        String transcription = restClient.post()
                .uri("/v1/audio/transcriptions")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(payload)
                .retrieve()
                .body(String.class);

        return transcription == null ? "" : transcription;
    }

    private String resolveFileExtension(String mimeType) {
        if (mimeType == null || mimeType.isBlank()) {
            return ".webm";
        }

        String normalized = mimeType.toLowerCase();
        if (normalized.contains("webm")) {
            return ".webm";
        }
        if (normalized.contains("mp4")) {
            return ".mp4";
        }
        if (normalized.contains("mpeg") || normalized.contains("mp3")) {
            return ".mp3";
        }
        if (normalized.contains("wav")) {
            return ".wav";
        }
        if (normalized.contains("ogg")) {
            return ".ogg";
        }
        return ".webm";
    }

    private String normalizeTranscript(String transcriptText) {
        if (transcriptText == null) {
            return null;
        }
        String normalized = transcriptText.replaceAll("\\s+", " ").trim();
        if (normalized.isBlank()) {
            return null;
        }
        return normalized;
    }

    private static final class MeetingTranscriptionState {
        private final ByteArrayOutputStream audioBuffer = new ByteArrayOutputStream();
        private final AtomicLong outputSequence = new AtomicLong(0);
        private Instant windowStart;
        private String lastTranscriptText;
    }

    private static final class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;

        private NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}
