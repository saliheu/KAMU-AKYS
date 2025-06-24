package gov.citizen.complaintmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a citizen who can submit complaints
 * Şikayet/dilekçe gönderebilen vatandaş
 */
@Entity
@Table(name = "citizens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Citizen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "national_id", unique = true, nullable = false)
    private String nationalId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @OneToMany(mappedBy = "citizen", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Complaint> complaints = new ArrayList<>();

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "verification_date")
    private LocalDateTime verificationDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public void addComplaint(Complaint complaint) {
        complaints.add(complaint);
        complaint.setCitizen(this);
    }

    public enum Gender {
        MALE("Erkek"),
        FEMALE("Kadın"),
        OTHER("Diğer");

        private final String displayName;

        Gender(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}