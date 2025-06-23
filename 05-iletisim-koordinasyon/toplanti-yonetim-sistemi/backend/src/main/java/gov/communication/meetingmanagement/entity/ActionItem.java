package gov.communication.meetingmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "action_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id", nullable = false)
    private User assignedTo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private User assignedBy;
    
    @Column(nullable = false)
    private LocalDate dueDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionItemStatus status = ActionItemStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    private ActionItemPriority priority = ActionItemPriority.NORMAL;
    
    @Column(columnDefinition = "TEXT")
    private String completionNotes;
    
    private LocalDateTime completedDate;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;
    
    private LocalDateTime updatedDate;
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    
    public enum ActionItemStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        OVERDUE
    }
    
    public enum ActionItemPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
}