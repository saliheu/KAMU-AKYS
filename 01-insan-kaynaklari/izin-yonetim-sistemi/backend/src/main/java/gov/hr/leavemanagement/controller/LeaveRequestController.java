package gov.hr.leavemanagement.controller;

import gov.hr.leavemanagement.dto.CreateLeaveRequestDTO;
import gov.hr.leavemanagement.dto.LeaveRequestDTO;
import gov.hr.leavemanagement.entity.User;
import gov.hr.leavemanagement.service.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {
    
    private final LeaveRequestService leaveRequestService;
    
    @PostMapping
    public ResponseEntity<LeaveRequestDTO> createLeaveRequest(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateLeaveRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(leaveRequestService.createLeaveRequest(currentUser, request));
    }
    
    @GetMapping("/my-requests")
    public ResponseEntity<Page<LeaveRequestDTO>> getMyLeaveRequests(
            @AuthenticationPrincipal User currentUser,
            Pageable pageable) {
        return ResponseEntity.ok(leaveRequestService.getUserLeaveRequests(currentUser, pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequestDTO> getLeaveRequest(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequest(currentUser, id));
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<LeaveRequestDTO> cancelLeaveRequest(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(leaveRequestService.cancelLeaveRequest(currentUser, id));
    }
}