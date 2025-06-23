package gov.communication.meetingmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String agenda;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private MeetingRoom room;
    
    private String location; // For external or online meetings
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    @Column(nullable = false)
    private LocalDateTime endTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingType type = MeetingType.IN_PERSON;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingStatus status = MeetingStatus.SCHEDULED;
    
    @Enumerated(EnumType.STRING)
    private MeetingPriority priority = MeetingPriority.NORMAL;
    
    private String onlineLink;
    private String onlineMeetingId;
    private String onlinePassword;
    
    @ManyToMany
    @JoinTable(
        name = "meeting_participants",
        joinColumns = @JoinColumn(name = "meeting_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> participants = new HashSet<>();
    
    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MeetingAttachment> attachments = new HashSet<>();
    
    @OneToOne(mappedBy = "meeting", cascade = CascadeType.ALL)
    private MeetingMinutes minutes;
    
    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ActionItem> actionItems = new HashSet<>();
    
    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MeetingParticipantResponse> participantResponses = new HashSet<>();
    
    private boolean isRecurring = false;
    
    @Enumerated(EnumType.STRING)
    private RecurrenceType recurrenceType;
    
    private Integer recurrenceInterval;
    private LocalDateTime recurrenceEndDate;
    
    private boolean sendReminder = true;
    private Integer reminderMinutesBefore = 30;
    
    private boolean isPublic = false;
    
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
    
    public enum MeetingType {
        IN_PERSON,
        ONLINE,
        HYBRID
    }
    
    public enum MeetingStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }
    
    public enum MeetingPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
    
    public enum RecurrenceType {
        DAILY,
        WEEKLY,
        MONTHLY,
        YEARLY
    }
}