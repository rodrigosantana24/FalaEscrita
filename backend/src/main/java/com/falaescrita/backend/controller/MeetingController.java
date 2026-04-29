package com.falaescrita.backend.controller;

import com.falaescrita.backend.dto.MeetingDto;
import com.falaescrita.backend.service.MeetingService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @GetMapping
    public List<MeetingDto> listMeetings() {
        return meetingService.listMeetings();
    }
}
