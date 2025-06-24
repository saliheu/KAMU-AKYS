package gov.citizen.complaintmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a government department that handles complaints
 * Şikayetleri işleyen devlet departmanı/birimi
 */
@Entity
@Table(name = "departments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_department_id")
    private Department parentDepartment;

    @OneToMany(mappedBy = "parentDepartment")
    @Builder.Default
    private List<Department> subDepartments = new ArrayList<>();

    @OneToMany(mappedBy = "department")
    @Builder.Default
    private List<User> staff = new ArrayList<>();

    @OneToMany(mappedBy = "assignedDepartment")
    @Builder.Default
    private List<Complaint> assignedComplaints = new ArrayList<>();

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

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
    public void addStaff(User user) {
        staff.add(user);
        user.setDepartment(this);
    }

    public void removeStaff(User user) {
        staff.remove(user);
        user.setDepartment(null);
    }

    public void addSubDepartment(Department subDepartment) {
        subDepartments.add(subDepartment);
        subDepartment.setParentDepartment(this);
    }
}