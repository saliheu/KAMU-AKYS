package gov.citizen.complaintmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a citizen complaint or petition
 * Vatandaş dilekçe/şikayet entity'si
 */
@Entity
@Table(name = "complaints")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String complaintNumber;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriorityLevel priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department assignedDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedOfficer;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintResponse> responses = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintHistory> history = new ArrayList<>();

    @Column(name = "expected_resolution_date")
    private LocalDateTime expectedResolutionDate;

    @Column(name = "actual_resolution_date")
    private LocalDateTime actualResolutionDate;

    @Column(name = "satisfaction_rating")
    private Integer satisfactionRating;

    @Column(name = "feedback_comments", columnDefinition = "TEXT")
    private String feedbackComments;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_anonymous")
    @Builder.Default
    private Boolean isAnonymous = false;

    @Column(name = "is_urgent")
    @Builder.Default
    private Boolean isUrgent = false;

    // Helper methods
    public void addResponse(ComplaintResponse response) {
        responses.add(response);
        response.setComplaint(this);
    }

    public void addAttachment(ComplaintAttachment attachment) {
        attachments.add(attachment);
        attachment.setComplaint(this);
    }

    public void addHistory(ComplaintHistory history) {
        this.history.add(history);
        history.setComplaint(this);
    }
}