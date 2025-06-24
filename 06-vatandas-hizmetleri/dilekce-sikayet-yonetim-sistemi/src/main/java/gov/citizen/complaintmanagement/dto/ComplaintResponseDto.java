package gov.citizen.complaintmanagement.dto;

import gov.citizen.complaintmanagement.entity.ComplaintResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for complaint response
 * Şikayet yanıtı DTO'su
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponseDto {

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Response type is required")
    private ComplaintResponse.ResponseType responseType;

    private Boolean isInternal;

    private Boolean isVisibleToCitizen;
}