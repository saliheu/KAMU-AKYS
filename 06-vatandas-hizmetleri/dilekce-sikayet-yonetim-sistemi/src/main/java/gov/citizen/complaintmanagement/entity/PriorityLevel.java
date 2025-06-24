package gov.citizen.complaintmanagement.entity;

/**
 * Enum representing priority levels for complaints
 * Öncelik seviyeleri
 */
public enum PriorityLevel {
    LOW("Düşük", 10),
    MEDIUM("Orta", 5),
    HIGH("Yüksek", 3),
    URGENT("Acil", 1);

    private final String displayName;
    private final int resolutionDays;

    PriorityLevel(String displayName, int resolutionDays) {
        this.displayName = displayName;
        this.resolutionDays = resolutionDays;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getResolutionDays() {
        return resolutionDays;
    }
}