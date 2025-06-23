package gov.hr.leavemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private DepartmentDTO parentDepartment;
    private Boolean isActive;
}