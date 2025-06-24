package gov.citizen.complaintmanagement.repository;

import gov.citizen.complaintmanagement.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Department entity
 * Departman entity repository arayüzü
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByCode(String code);

    Optional<Department> findByName(String name);

    List<Department> findByIsActiveTrue();

    List<Department> findByParentDepartmentId(Long parentId);

    @Query("SELECT d FROM Department d WHERE d.parentDepartment IS NULL")
    List<Department> findRootDepartments();

    boolean existsByCode(String code);
}