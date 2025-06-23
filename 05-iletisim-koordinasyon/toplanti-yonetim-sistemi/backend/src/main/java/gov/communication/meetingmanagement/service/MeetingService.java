package gov.communication.meetingmanagement.service;

import gov.communication.meetingmanagement.dto.*;
import gov.communication.meetingmanagement.entity.*;
import gov.communication.meetingmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {
    
    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final MeetingRoomRepository meetingRoomRepository;
    private final MeetingParticipantResponseRepository participantResponseRepository;
    
    @Transactional
    public MeetingDTO createMeeting(CreateMeetingRequest request) {
        User organizer = getCurrentUser();
        
        MeetingRoom room = null;
        if (request.getRoomId() != null) {
            room = meetingRoomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException("Toplantı odası bulunamadı"));
            
            // Check room availability
            List<Meeting> conflicts = meetingRepository.findConflictingMeetings(
                    room.getId(), request.getStartTime(), request.getEndTime());
            
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("Seçilen toplantı odası bu zaman aralığında müsait değil");
            }
        }
        
        Set<User> participants = new HashSet<>(userRepository.findAllById(request.getParticipantIds()));
        
        Meeting meeting = Meeting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .organizer(organizer)
                .room(room)
                .type(request.getType())
                .status(Meeting.MeetingStatus.SCHEDULED)
                .location(request.getLocation())
                .onlineLink(request.getOnlineLink())
                .agenda(request.getAgenda())
                .sendReminder(request.isSendReminder())
                .reminderMinutes(request.getReminderMinutes())
                .isRecurring(request.isRecurring())
                .recurrenceType(request.getRecurrenceType())
                .recurrenceInterval(request.getRecurrenceInterval())
                .recurrenceEndDate(request.getRecurrenceEndDate())
                .participants(participants)
                .build();
        
        meeting = meetingRepository.save(meeting);
        
        // Create participant responses
        for (User participant : participants) {
            MeetingParticipantResponse response = MeetingParticipantResponse.builder()
                    .meeting(meeting)
                    .participant(participant)
                    .status(MeetingParticipantResponse.ResponseStatus.PENDING)
                    .build();
            participantResponseRepository.save(response);
        }
        
        return MeetingDTO.fromEntity(meeting);
    }
    
    @Transactional
    public MeetingDTO updateMeeting(Long id, UpdateMeetingRequest request) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Toplantı bulunamadı"));
        
        User currentUser = getCurrentUser();
        if (!meeting.getOrganizer().getId().equals(currentUser.getId()) && !isAdmin(currentUser)) {
            throw new IllegalStateException("Bu toplantıyı düzenleme yetkiniz yok");
        }
        
        if (meeting.getStatus() == Meeting.MeetingStatus.COMPLETED) {
            throw new IllegalStateException("Tamamlanmış toplantılar düzenlenemez");
        }
        
        if (request.getTitle() != null) {
            meeting.setTitle(request.getTitle());
        }
        
        if (request.getDescription() != null) {
            meeting.setDescription(request.getDescription());
        }
        
        boolean timeChanged = false;
        if (request.getStartTime() != null) {
            meeting.setStartTime(request.getStartTime());
            timeChanged = true;
        }
        
        if (request.getEndTime() != null) {
            meeting.setEndTime(request.getEndTime());
            timeChanged = true;
        }
        
        if (request.getRoomId() != null) {
            MeetingRoom room = meetingRoomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException("Toplantı odası bulunamadı"));
            
            if (timeChanged || !room.getId().equals(meeting.getRoom().getId())) {
                List<Meeting> conflicts = meetingRepository.findConflictingMeetings(
                        room.getId(), meeting.getStartTime(), meeting.getEndTime());
                
                conflicts.removeIf(m -> m.getId().equals(meeting.getId()));
                
                if (!conflicts.isEmpty()) {
                    throw new IllegalStateException("Seçilen toplantı odası bu zaman aralığında müsait değil");
                }
            }
            
            meeting.setRoom(room);
        }
        
        if (request.getType() != null) {
            meeting.setType(request.getType());
        }
        
        if (request.getLocation() != null) {
            meeting.setLocation(request.getLocation());
        }
        
        if (request.getOnlineLink() != null) {
            meeting.setOnlineLink(request.getOnlineLink());
        }
        
        if (request.getAgenda() != null) {
            meeting.setAgenda(request.getAgenda());
        }
        
        if (request.getSendReminder() != null) {
            meeting.setSendReminder(request.getSendReminder());
        }
        
        if (request.getReminderMinutes() != null) {
            meeting.setReminderMinutes(request.getReminderMinutes());
        }
        
        if (request.getParticipantIds() != null) {
            Set<User> participants = new HashSet<>(userRepository.findAllById(request.getParticipantIds()));
            meeting.setParticipants(participants);
        }
        
        meeting = meetingRepository.save(meeting);
        
        return MeetingDTO.fromEntity(meeting);
    }
    
    @Transactional(readOnly = true)
    public MeetingDTO getMeeting(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Toplantı bulunamadı"));
        return MeetingDTO.fromEntity(meeting);
    }
    
    @Transactional(readOnly = true)
    public Page<MeetingDTO> getMyMeetings(Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Meeting> meetings = meetingRepository.findByParticipantId(currentUser.getId(), pageable);
        return meetings.map(MeetingDTO::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public Page<MeetingDTO> getOrganizedMeetings(Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Meeting> meetings = meetingRepository.findByOrganizerId(currentUser.getId(), pageable);
        return meetings.map(MeetingDTO::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public List<MeetingDTO> getUpcomingMeetings() {
        User currentUser = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        List<Meeting> meetings = meetingRepository.findUpcomingMeetingsForUser(currentUser.getId(), now);
        return meetings.stream()
                .map(MeetingDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<MeetingDTO> searchMeetings(String search, Pageable pageable) {
        Page<Meeting> meetings = meetingRepository.searchMeetings(search, pageable);
        return meetings.map(MeetingDTO::fromEntity);
    }
    
    @Transactional
    public void cancelMeeting(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Toplantı bulunamadı"));
        
        User currentUser = getCurrentUser();
        if (!meeting.getOrganizer().getId().equals(currentUser.getId()) && !isAdmin(currentUser)) {
            throw new IllegalStateException("Bu toplantıyı iptal etme yetkiniz yok");
        }
        
        if (meeting.getStatus() != Meeting.MeetingStatus.SCHEDULED) {
            throw new IllegalStateException("Sadece planlanmış toplantılar iptal edilebilir");
        }
        
        meeting.setStatus(Meeting.MeetingStatus.CANCELLED);
        meetingRepository.save(meeting);
    }
    
    @Transactional
    public void startMeeting(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Toplantı bulunamadı"));
        
        User currentUser = getCurrentUser();
        if (!meeting.getOrganizer().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Sadece toplantı organizatörü toplantıyı başlatabilir");
        }
        
        if (meeting.getStatus() != Meeting.MeetingStatus.SCHEDULED) {
            throw new IllegalStateException("Toplantı zaten başlatılmış veya tamamlanmış");
        }
        
        meeting.setStatus(Meeting.MeetingStatus.IN_PROGRESS);
        meetingRepository.save(meeting);
    }
    
    @Transactional
    public void completeMeeting(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Toplantı bulunamadı"));
        
        User currentUser = getCurrentUser();
        if (!meeting.getOrganizer().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Sadece toplantı organizatörü toplantıyı tamamlayabilir");
        }
        
        if (meeting.getStatus() != Meeting.MeetingStatus.IN_PROGRESS) {
            throw new IllegalStateException("Toplantı devam etmiyor");
        }
        
        meeting.setStatus(Meeting.MeetingStatus.COMPLETED);
        meetingRepository.save(meeting);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Kullanıcı bulunamadı"));
    }
    
    private boolean isAdmin(User user) {
        return user.getRole() == User.Role.ADMIN;
    }
}