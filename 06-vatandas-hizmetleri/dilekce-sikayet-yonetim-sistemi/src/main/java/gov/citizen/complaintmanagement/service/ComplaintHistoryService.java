package gov.citizen.complaintmanagement.service;

import gov.citizen.complaintmanagement.entity.Complaint;
import gov.citizen.complaintmanagement.entity.ComplaintHistory;
import gov.citizen.complaintmanagement.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing complaint history
 * Şikayet geçmişi yönetim servisi
 */
@Service
@RequiredArgsConstructor
public class ComplaintHistoryService {

    @Transactional
    public void addHistory(Complaint complaint, User user, ComplaintHistory.ActionType actionType,
                          String oldValue, String newValue, String description) {
        ComplaintHistory history = ComplaintHistory.builder()
                .complaint(complaint)
                .user(user)
                .actionType(actionType)
                .oldValue(oldValue)
                .newValue(newValue)
                .description(description)
                .build();

        complaint.addHistory(history);
    }
}