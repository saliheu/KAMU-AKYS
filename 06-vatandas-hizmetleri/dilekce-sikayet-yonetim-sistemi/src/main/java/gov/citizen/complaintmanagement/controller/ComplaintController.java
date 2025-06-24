package gov.citizen.complaintmanagement.controller;

import gov.citizen.complaintmanagement.dto.ComplaintCreateDto;
import gov.citizen.complaintmanagement.dto.ComplaintResponseDto;
import gov.citizen.complaintmanagement.dto.ComplaintUpdateDto;
import gov.citizen.complaintmanagement.entity.Complaint;
import gov.citizen.complaintmanagement.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing complaints
 * Şikayet yönetimi REST controller
 */
@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Complaint management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @Operation(summary = "Create a new complaint", description = "Creates a new complaint for the authenticated citizen")
    public ResponseEntity<Complaint> createComplaint(@Valid @RequestBody ComplaintCreateDto dto) {
        // TODO: Get authenticated citizen from security context
        // Complaint complaint = complaintService.createComplaint(dto, citizen);
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complaint by ID", description = "Retrieves a complaint by its ID")
    public ResponseEntity<Complaint> getComplaint(@PathVariable Long id) {
        Complaint complaint = complaintService.getComplaint(id);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/track/{complaintNumber}")
    @Operation(summary = "Track complaint by number", description = "Track a complaint using its tracking number")
    public ResponseEntity<Complaint> trackComplaint(@PathVariable String complaintNumber) {
        Complaint complaint = complaintService.getComplaintByNumber(complaintNumber);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/my-complaints")
    @Operation(summary = "Get my complaints", description = "Get complaints of the authenticated citizen")
    public ResponseEntity<Page<Complaint>> getMyComplaints(Pageable pageable) {
        // TODO: Get authenticated citizen from security context
        // Page<Complaint> complaints = complaintService.getComplaintsByCitizen(citizenId, pageable);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Get complaints by department", description = "Get complaints assigned to a specific department")
    public ResponseEntity<Page<Complaint>> getComplaintsByDepartment(
            @PathVariable Long departmentId, 
            Pageable pageable) {
        Page<Complaint> complaints = complaintService.getComplaintsByDepartment(departmentId, pageable);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Search complaints", description = "Search complaints by keyword")
    public ResponseEntity<Page<Complaint>> searchComplaints(
            @RequestParam String keyword,
            Pageable pageable) {
        Page<Complaint> complaints = complaintService.searchComplaints(keyword, pageable);
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Update complaint", description = "Update complaint status, priority, or assignment")
    public ResponseEntity<Complaint> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintUpdateDto dto) {
        // TODO: Get authenticated user from security context
        // Complaint complaint = complaintService.updateComplaint(id, dto, user);
        return ResponseEntity.ok(null);
    }

    @PostMapping("/{id}/responses")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Add response to complaint", description = "Add a response to a complaint")
    public ResponseEntity<Void> addResponse(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintResponseDto dto) {
        // TODO: Get authenticated user from security context
        // complaintService.addResponse(id, dto, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/satisfaction")
    @Operation(summary = "Rate complaint resolution", description = "Submit satisfaction rating for resolved complaint")
    public ResponseEntity<Void> rateSatisfaction(
            @PathVariable Long id,
            @RequestParam Integer rating,
            @RequestParam(required = false) String feedback) {
        complaintService.updateSatisfactionRating(id, rating, feedback);
        return ResponseEntity.ok().build();
    }
}