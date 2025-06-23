package gov.communication.meetingmanagement.repository;

import gov.communication.meetingmanagement.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    Optional<Department> findByCode(String code);
    
    List<Department> findByParentIsNull();
    
    List<Department> findByParentId(Long parentId);
    
    boolean existsByCode(String code);
}