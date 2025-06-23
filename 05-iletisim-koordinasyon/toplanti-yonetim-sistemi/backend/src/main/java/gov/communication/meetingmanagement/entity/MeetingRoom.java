package gov.communication.meetingmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "meeting_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingRoom {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(unique = true)
    private String code;
    
    private String building;
    private String floor;
    private Integer capacity;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ElementCollection
    @CollectionTable(name = "room_equipment", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "equipment")
    private Set<String> equipment = new HashSet<>();
    
    @Column(nullable = false)
    private boolean active = true;
    
    private boolean hasProjector = false;
    private boolean hasVideoConference = false;
    private boolean hasWhiteboard = false;
    private boolean hasAirConditioning = false;
    
    @OneToMany(mappedBy = "room")
    private Set<Meeting> meetings = new HashSet<>();
    
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
}