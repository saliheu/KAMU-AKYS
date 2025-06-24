package gov.citizen.complaintmanagement.entity;

/**
 * Enum representing different types of complaints
 * Şikayet/Dilekçe türleri
 */
public enum ComplaintType {
    COMPLAINT("Şikayet"),
    REQUEST("Talep"),
    SUGGESTION("Öneri"),
    INFORMATION_REQUEST("Bilgi Edinme"),
    APPRECIATION("Teşekkür"),
    REPORT("İhbar"),
    OTHER("Diğer");

    private final String displayName;

    ComplaintType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}