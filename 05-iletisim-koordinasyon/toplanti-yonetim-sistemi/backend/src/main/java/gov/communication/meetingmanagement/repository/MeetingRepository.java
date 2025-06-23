package gov.communication.meetingmanagement.repository;

import gov.communication.meetingmanagement.entity.Meeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    
    Page<Meeting> findByOrganizerId(Long organizerId, Pageable pageable);
    
    @Query("SELECT m FROM Meeting m JOIN m.participants p WHERE p.id = :userId")
    Page<Meeting> findByParticipantId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT m FROM Meeting m WHERE m.room.id = :roomId AND m.status != 'CANCELLED' AND ((m.startTime BETWEEN :startTime AND :endTime) OR (m.endTime BETWEEN :startTime AND :endTime) OR (m.startTime <= :startTime AND m.endTime >= :endTime))")
    List<Meeting> findConflictingMeetings(@Param("roomId") Long roomId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    List<Meeting> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT m FROM Meeting m WHERE m.status = 'SCHEDULED' AND m.startTime BETWEEN :now AND :reminderTime AND m.sendReminder = true")
    List<Meeting> findUpcomingMeetingsForReminder(@Param("now") LocalDateTime now, @Param("reminderTime") LocalDateTime reminderTime);
    
    @Query("SELECT m FROM Meeting m WHERE (m.organizer.id = :userId OR :userId IN (SELECT p.id FROM m.participants p)) AND m.startTime >= :startDate ORDER BY m.startTime")
    List<Meeting> findUpcomingMeetingsForUser(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    Page<Meeting> findByStatus(Meeting.MeetingStatus status, Pageable pageable);
    
    @Query("SELECT m FROM Meeting m WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Meeting> searchMeetings(@Param("search") String search, Pageable pageable);
}