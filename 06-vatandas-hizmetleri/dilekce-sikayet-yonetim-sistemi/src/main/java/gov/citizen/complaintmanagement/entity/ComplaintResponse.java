package gov.citizen.complaintmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing a response to a complaint
 * Şikayete verilen yanıt
 */
@Entity
@Table(name = "complaint_responses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id", nullable = false)
    private User responder;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResponseType responseType;

    @Column(name = "is_internal")
    @Builder.Default
    private Boolean isInternal = false;

    @Column(name = "is_visible_to_citizen")
    @Builder.Default
    private Boolean isVisibleToCitizen = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ResponseType {
        INITIAL_RESPONSE("İlk Yanıt"),
        UPDATE("Güncelleme"),
        REQUEST_INFO("Bilgi Talebi"),
        FINAL_RESPONSE("Son Yanıt"),
        INTERNAL_NOTE("Dahili Not");

        private final String displayName;

        ResponseType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}