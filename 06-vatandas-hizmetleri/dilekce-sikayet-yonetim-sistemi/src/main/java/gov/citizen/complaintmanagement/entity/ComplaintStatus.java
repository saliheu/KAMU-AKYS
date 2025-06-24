package gov.citizen.complaintmanagement.entity;

/**
 * Enum representing the status of a complaint throughout its lifecycle
 * Şikayet/Dilekçe durumları
 */
public enum ComplaintStatus {
    SUBMITTED("Gönderildi"),
    UNDER_REVIEW("İnceleniyor"),
    ASSIGNED("Atandı"),
    IN_PROGRESS("İşlemde"),
    WAITING_CITIZEN_RESPONSE("Vatandaş Yanıtı Bekleniyor"),
    RESOLVED("Çözümlendi"),
    CLOSED("Kapatıldı"),
    REJECTED("Reddedildi"),
    CANCELLED("İptal Edildi");

    private final String displayName;

    ComplaintStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}