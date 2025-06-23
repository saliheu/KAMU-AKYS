package gov.hr.leavemanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = false)
    private LocalDate endDate;
    
    @Column(nullable = false)
    private Integer totalDays;
    
    @Column(length = 1000)
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status = LeaveStatus.PENDING;
    
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    private LocalDateTime approvedAt;
    
    @Column(length = 500)
    private String approvalComment;
    
    @Column(length = 500)
    private String rejectionReason;
    
    private String attachmentPath;
    
    @Column(nullable = false)
    private Boolean halfDay = false;
    
    @Enumerated(EnumType.STRING)
    private HalfDayPeriod halfDayPeriod;
    
    @ManyToOne
    @JoinColumn(name = "substitute_user_id")
    private User substituteUser;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    public enum LeaveType {
        ANNUAL, SICK, MATERNITY, PATERNITY, MARRIAGE, BEREAVEMENT, UNPAID, ADMINISTRATIVE, OTHER
    }
    
    public enum LeaveStatus {
        PENDING, APPROVED, REJECTED, CANCELLED, WITHDRAWN
    }
    
    public enum HalfDayPeriod {
        MORNING, AFTERNOON
    }
}