package gov.communication.meetingmanagement.controller;

import gov.communication.meetingmanagement.dto.*;
import gov.communication.meetingmanagement.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {
    
    private final MeetingService meetingService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MeetingDTO> createMeeting(@Valid @RequestBody CreateMeetingRequest request) {
        MeetingDTO meeting = meetingService.createMeeting(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(meeting);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MeetingDTO> updateMeeting(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMeetingRequest request
    ) {
        MeetingDTO meeting = meetingService.updateMeeting(id, request);
        return ResponseEntity.ok(meeting);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MeetingDTO> getMeeting(@PathVariable Long id) {
        MeetingDTO meeting = meetingService.getMeeting(id);
        return ResponseEntity.ok(meeting);
    }
    
    @GetMapping("/my-meetings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MeetingDTO>> getMyMeetings(
            @PageableDefault(size = 20, sort = "startTime") Pageable pageable
    ) {
        Page<MeetingDTO> meetings = meetingService.getMyMeetings(pageable);
        return ResponseEntity.ok(meetings);
    }
    
    @GetMapping("/organized")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MeetingDTO>> getOrganizedMeetings(
            @PageableDefault(size = 20, sort = "startTime") Pageable pageable
    ) {
        Page<MeetingDTO> meetings = meetingService.getOrganizedMeetings(pageable);
        return ResponseEntity.ok(meetings);
    }
    
    @GetMapping("/upcoming")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MeetingDTO>> getUpcomingMeetings() {
        List<MeetingDTO> meetings = meetingService.getUpcomingMeetings();
        return ResponseEntity.ok(meetings);
    }
    
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MeetingDTO>> searchMeetings(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "startTime") Pageable pageable
    ) {
        Page<MeetingDTO> meetings = meetingService.searchMeetings(q, pageable);
        return ResponseEntity.ok(meetings);
    }
    
    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelMeeting(@PathVariable Long id) {
        meetingService.cancelMeeting(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> startMeeting(@PathVariable Long id) {
        meetingService.startMeeting(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> completeMeeting(@PathVariable Long id) {
        meetingService.completeMeeting(id);
        return ResponseEntity.noContent().build();
    }
}