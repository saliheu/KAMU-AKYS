package gov.hr.leavemanagement.service;

import gov.hr.leavemanagement.dto.CreateLeaveRequestDTO;
import gov.hr.leavemanagement.dto.LeaveRequestDTO;
import gov.hr.leavemanagement.entity.LeaveRequest;
import gov.hr.leavemanagement.entity.User;
import gov.hr.leavemanagement.exception.BadRequestException;
import gov.hr.leavemanagement.exception.ResourceNotFoundException;
import gov.hr.leavemanagement.repository.LeaveRequestRepository;
import gov.hr.leavemanagement.repository.UserRepository;
import gov.hr.leavemanagement.util.LeaveRequestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {
    
    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final LeaveRequestMapper leaveRequestMapper;
    
    @Transactional
    public LeaveRequestDTO createLeaveRequest(User currentUser, CreateLeaveRequestDTO request) {
        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }
        
        // Check for overlapping requests
        List<LeaveRequest> overlappingRequests = leaveRequestRepository.findOverlappingRequests(
            currentUser.getId(),
            request.getStartDate(),
            request.getEndDate(),
            Arrays.asList(LeaveRequest.LeaveStatus.PENDING, LeaveRequest.LeaveStatus.APPROVED)
        );
        
        if (!overlappingRequests.isEmpty()) {
            throw new BadRequestException("You already have a leave request for these dates");
        }
        
        // Calculate total days (excluding weekends)
        int totalDays = calculateWorkingDays(request.getStartDate(), request.getEndDate());
        if (request.getHalfDay()) {
            totalDays = 1; // Half day is always counted as 1 day
        }
        
        // Check leave balance
        checkLeaveBalance(currentUser, request.getLeaveType(), totalDays);
        
        // Create leave request
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(currentUser);
        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setTotalDays(totalDays);
        leaveRequest.setReason(request.getReason());
        leaveRequest.setHalfDay(request.getHalfDay());
        leaveRequest.setHalfDayPeriod(request.getHalfDayPeriod());
        leaveRequest.setAttachmentPath(request.getAttachmentPath());
        
        if (request.getSubstituteUserId() != null) {
            User substituteUser = userRepository.findById(request.getSubstituteUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Substitute user not found"));
            leaveRequest.setSubstituteUser(substituteUser);
        }
        
        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        return leaveRequestMapper.toDTO(savedRequest);
    }
    
    public Page<LeaveRequestDTO> getUserLeaveRequests(User user, Pageable pageable) {
        return leaveRequestRepository.findByUser(user, pageable)
            .map(leaveRequestMapper::toDTO);
    }
    
    public LeaveRequestDTO getLeaveRequest(User user, Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        
        // Check if user has access to this request
        if (!leaveRequest.getUser().getId().equals(user.getId()) && 
            !user.getRole().equals(User.Role.HR) && 
            !user.getRole().equals(User.Role.ADMIN) &&
            !isUserManager(user, leaveRequest.getUser())) {
            throw new UnauthorizedException("You don't have access to this leave request");
        }
        
        return leaveRequestMapper.toDTO(leaveRequest);
    }
    
    @Transactional
    public LeaveRequestDTO cancelLeaveRequest(User user, Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        
        // Check if user owns this request
        if (!leaveRequest.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only cancel your own leave requests");
        }
        
        // Check if request can be cancelled
        if (!Arrays.asList(LeaveRequest.LeaveStatus.PENDING, LeaveRequest.LeaveStatus.APPROVED)
                .contains(leaveRequest.getStatus())) {
            throw new BadRequestException("This leave request cannot be cancelled");
        }
        
        // Check if leave has already started
        if (leaveRequest.getStartDate().isBefore(LocalDate.now()) || 
            leaveRequest.getStartDate().equals(LocalDate.now())) {
            throw new BadRequestException("Cannot cancel leave that has already started");
        }
        
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.CANCELLED);
        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        
        return leaveRequestMapper.toDTO(savedRequest);
    }
    
    private int calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        int workingDays = 0;
        LocalDate date = startDate;
        
        while (!date.isAfter(endDate)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            if (dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY) {
                workingDays++;
            }
            date = date.plusDays(1);
        }
        
        return workingDays;
    }
    
    private void checkLeaveBalance(User user, LeaveRequest.LeaveType leaveType, int requestedDays) {
        int availableBalance = 0;
        
        switch (leaveType) {
            case ANNUAL:
                availableBalance = user.getAnnualLeaveBalance() - user.getUsedAnnualLeave();
                break;
            case SICK:
                availableBalance = user.getSickLeaveBalance() - user.getUsedSickLeave();
                break;
            default:
                return; // No balance check for other leave types
        }
        
        if (requestedDays > availableBalance) {
            throw new BadRequestException("Insufficient leave balance. Available: " + availableBalance + " days");
        }
    }
    
    private boolean isUserManager(User manager, User employee) {
        return employee.getManager() != null && employee.getManager().getId().equals(manager.getId());
    }
}