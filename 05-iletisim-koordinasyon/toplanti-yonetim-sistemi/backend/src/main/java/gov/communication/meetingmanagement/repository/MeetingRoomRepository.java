package gov.communication.meetingmanagement.repository;

import gov.communication.meetingmanagement.entity.MeetingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRoomRepository extends JpaRepository<MeetingRoom, Long> {
    
    List<MeetingRoom> findByIsAvailable(boolean available);
    
    List<MeetingRoom> findByCapacityGreaterThanEqual(Integer capacity);
    
    List<MeetingRoom> findByHasVideoConference(boolean hasVideoConference);
    
    List<MeetingRoom> findByLocationContainingIgnoreCase(String location);
}