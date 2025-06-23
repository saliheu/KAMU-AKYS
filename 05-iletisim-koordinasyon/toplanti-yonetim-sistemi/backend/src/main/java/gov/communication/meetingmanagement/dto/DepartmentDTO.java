package gov.communication.meetingmanagement.dto;

import gov.communication.meetingmanagement.entity.Department;
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
    private String name;
    private String code;
    private Long parentId;
    private String parentName;
    
    public static DepartmentDTO fromEntity(Department department) {
        return DepartmentDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .code(department.getCode())
                .parentId(department.getParent() != null ? department.getParent().getId() : null)
                .parentName(department.getParent() != null ? department.getParent().getName() : null)
                .build();
    }
}