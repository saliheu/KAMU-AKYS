package gov.citizen.complaintmanagement.service;

import gov.citizen.complaintmanagement.dto.ComplaintCreateDto;
import gov.citizen.complaintmanagement.dto.ComplaintResponseDto;
import gov.citizen.complaintmanagement.dto.ComplaintUpdateDto;
import gov.citizen.complaintmanagement.entity.*;
import gov.citizen.complaintmanagement.exception.ResourceNotFoundException;
import gov.citizen.complaintmanagement.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for managing complaints
 * Şikayet yönetimi servisi
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintHistoryService historyService;

    @Transactional
    public Complaint createComplaint(ComplaintCreateDto dto, Citizen citizen) {
        Complaint complaint = Complaint.builder()
                .complaintNumber(generateComplaintNumber())
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .type(dto.getType())
                .status(ComplaintStatus.SUBMITTED)
                .priority(dto.getPriority() != null ? dto.getPriority() : PriorityLevel.MEDIUM)
                .citizen(citizen)
                .isAnonymous(dto.getIsAnonymous() != null ? dto.getIsAnonymous() : false)
                .isUrgent(dto.getPriority() == PriorityLevel.URGENT)
                .expectedResolutionDate(calculateExpectedResolutionDate(dto.getPriority()))
                .build();

        complaint = complaintRepository.save(complaint);

        // Add history entry
        historyService.addHistory(complaint, null, ComplaintHistory.ActionType.CREATED, 
                null, complaint.getStatus().toString(), "Complaint created");

        log.info("Complaint created with number: {}", complaint.getComplaintNumber());
        return complaint;
    }

    @Transactional(readOnly = true)
    public Complaint getComplaint(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Complaint getComplaintByNumber(String complaintNumber) {
        return complaintRepository.findByComplaintNumber(complaintNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with number: " + complaintNumber));
    }

    @Transactional(readOnly = true)
    public Page<Complaint> getComplaintsByCitizen(Long citizenId, Pageable pageable) {
        return complaintRepository.findByCitizenId(citizenId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Complaint> getComplaintsByDepartment(Long departmentId, Pageable pageable) {
        return complaintRepository.findByAssignedDepartmentId(departmentId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Complaint> getComplaintsByOfficer(Long officerId, Pageable pageable) {
        return complaintRepository.findByAssignedOfficerId(officerId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Complaint> searchComplaints(String keyword, Pageable pageable) {
        return complaintRepository.searchComplaints(keyword, pageable);
    }

    @Transactional
    public Complaint updateComplaint(Long id, ComplaintUpdateDto dto, User updatedBy) {
        Complaint complaint = getComplaint(id);
        String oldStatus = complaint.getStatus().toString();
        String oldPriority = complaint.getPriority().toString();

        if (dto.getStatus() != null && dto.getStatus() != complaint.getStatus()) {
            complaint.setStatus(dto.getStatus());
            historyService.addHistory(complaint, updatedBy, ComplaintHistory.ActionType.STATUS_CHANGED,
                    oldStatus, dto.getStatus().toString(), "Status changed");

            if (dto.getStatus() == ComplaintStatus.RESOLVED || dto.getStatus() == ComplaintStatus.CLOSED) {
                complaint.setActualResolutionDate(LocalDateTime.now());
            }
        }

        if (dto.getPriority() != null && dto.getPriority() != complaint.getPriority()) {
            complaint.setPriority(dto.getPriority());
            complaint.setExpectedResolutionDate(calculateExpectedResolutionDate(dto.getPriority()));
            historyService.addHistory(complaint, updatedBy, ComplaintHistory.ActionType.PRIORITY_CHANGED,
                    oldPriority, dto.getPriority().toString(), "Priority changed");
        }

        if (dto.getAssignedDepartmentId() != null) {
            // Handle department assignment
            historyService.addHistory(complaint, updatedBy, ComplaintHistory.ActionType.DEPARTMENT_CHANGED,
                    complaint.getAssignedDepartment() != null ? complaint.getAssignedDepartment().getName() : null,
                    "Department " + dto.getAssignedDepartmentId(), "Department changed");
        }

        if (dto.getAssignedOfficerId() != null) {
            // Handle officer assignment
            historyService.addHistory(complaint, updatedBy, ComplaintHistory.ActionType.ASSIGNED,
                    complaint.getAssignedOfficer() != null ? complaint.getAssignedOfficer().getFullName() : null,
                    "Officer " + dto.getAssignedOfficerId(), "Assigned to officer");
        }

        return complaintRepository.save(complaint);
    }

    @Transactional
    public void addResponse(Long complaintId, ComplaintResponseDto responseDto, User responder) {
        Complaint complaint = getComplaint(complaintId);
        
        ComplaintResponse response = ComplaintResponse.builder()
                .complaint(complaint)
                .responder(responder)
                .message(responseDto.getMessage())
                .responseType(responseDto.getResponseType())
                .isInternal(responseDto.getIsInternal() != null ? responseDto.getIsInternal() : false)
                .isVisibleToCitizen(responseDto.getIsVisibleToCitizen() != null ? responseDto.getIsVisibleToCitizen() : true)
                .build();

        complaint.addResponse(response);
        complaintRepository.save(complaint);

        historyService.addHistory(complaint, responder, ComplaintHistory.ActionType.RESPONSE_ADDED,
                null, response.getResponseType().toString(), "Response added");

        log.info("Response added to complaint: {}", complaintId);
    }

    @Transactional
    public void updateSatisfactionRating(Long complaintId, Integer rating, String feedback) {
        Complaint complaint = getComplaint(complaintId);
        complaint.setSatisfactionRating(rating);
        complaint.setFeedbackComments(feedback);
        complaintRepository.save(complaint);

        log.info("Satisfaction rating updated for complaint: {}", complaintId);
    }

    private String generateComplaintNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "SIK-" + year + "-" + uuid;
    }

    private LocalDateTime calculateExpectedResolutionDate(PriorityLevel priority) {
        if (priority == null) {
            priority = PriorityLevel.MEDIUM;
        }
        return LocalDateTime.now().plusDays(priority.getResolutionDays());
    }
}