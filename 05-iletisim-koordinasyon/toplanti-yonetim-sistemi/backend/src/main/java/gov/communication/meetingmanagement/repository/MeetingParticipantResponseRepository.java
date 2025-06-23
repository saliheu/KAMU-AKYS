package gov.communication.meetingmanagement.repository;

import gov.communication.meetingmanagement.entity.MeetingParticipantResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingParticipantResponseRepository extends JpaRepository<MeetingParticipantResponse, Long> {
    
    Optional<MeetingParticipantResponse> findByMeetingIdAndParticipantId(Long meetingId, Long participantId);
    
    List<MeetingParticipantResponse> findByMeetingId(Long meetingId);
    
    List<MeetingParticipantResponse> findByParticipantId(Long participantId);
    
    List<MeetingParticipantResponse> findByMeetingIdAndStatus(Long meetingId, MeetingParticipantResponse.ResponseStatus status);
}