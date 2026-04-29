package com.falaescrita.backend.service;

import com.falaescrita.backend.dto.MeetingDto;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MeetingService {

    private final List<MeetingDto> seededMeetings = List.of(
            new MeetingDto("meeting-001", "Daily do Time Produto", "ENCERRADA", Instant.now().minus(2, ChronoUnit.DAYS)),
            new MeetingDto("meeting-002", "Refinamento Backlog", "ENCERRADA", Instant.now().minus(1, ChronoUnit.DAYS)),
            new MeetingDto("meeting-003", "Planejamento Sprint", "EM_ANDAMENTO", Instant.now().minus(30, ChronoUnit.MINUTES))
    );

    public List<MeetingDto> listMeetings() {
        return seededMeetings;
    }
}
