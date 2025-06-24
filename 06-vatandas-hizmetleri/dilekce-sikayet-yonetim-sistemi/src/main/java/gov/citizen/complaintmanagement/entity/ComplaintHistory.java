package gov.citizen.complaintmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing the history/audit trail of a complaint
 * Şikayet geçmişi/denetim izi
 */
@Entity
@Table(name = "complaint_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType actionType;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "ip_address")
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ActionType {
        CREATED("Oluşturuldu"),
        STATUS_CHANGED("Durum Değişti"),
        PRIORITY_CHANGED("Öncelik Değişti"),
        ASSIGNED("Atandı"),
        DEPARTMENT_CHANGED("Departman Değişti"),
        RESPONSE_ADDED("Yanıt Eklendi"),
        ATTACHMENT_ADDED("Dosya Eklendi"),
        ATTACHMENT_REMOVED("Dosya Silindi"),
        UPDATED("Güncellendi"),
        VIEWED("Görüntülendi"),
        EXPORTED("Dışa Aktarıldı");

        private final String displayName;

        ActionType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}