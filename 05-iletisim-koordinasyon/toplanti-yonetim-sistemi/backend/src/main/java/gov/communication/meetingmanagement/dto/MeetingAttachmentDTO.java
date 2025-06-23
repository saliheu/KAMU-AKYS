package gov.communication.meetingmanagement.dto;

import gov.communication.meetingmanagement.entity.MeetingAttachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeetingAttachmentDTO {
    
    private Long id;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String filePath;
    private UserDTO uploadedBy;
    private LocalDateTime uploadedAt;
    
    public static MeetingAttachmentDTO fromEntity(MeetingAttachment attachment) {
        return MeetingAttachmentDTO.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .filePath(attachment.getFilePath())
                .uploadedBy(UserDTO.fromEntity(attachment.getUploadedBy()))
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}