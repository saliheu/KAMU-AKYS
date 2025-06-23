package gov.communication.meetingmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_participant_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingParticipantResponse {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private User participant;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResponseStatus responseStatus = ResponseStatus.NO_RESPONSE;
    
    @Column(columnDefinition = "TEXT")
    private String responseNote;
    
    private LocalDateTime respondedDate;
    
    private boolean attended = false;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
    
    public enum ResponseStatus {
        NO_RESPONSE,
        ACCEPTED,
        DECLINED,
        TENTATIVE
    }
}