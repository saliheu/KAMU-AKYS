package gov.hr.leavemanagement.repository;

import gov.hr.leavemanagement.entity.Department;
import gov.hr.leavemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByTcNo(String tcNo);
    
    Optional<User> findByEmployeeId(String employeeId);
    
    boolean existsByEmail(String email);
    
    boolean existsByTcNo(String tcNo);
    
    boolean existsByEmployeeId(String employeeId);
    
    List<User> findByDepartment(Department department);
    
    List<User> findByManager(User manager);
    
    List<User> findByRole(User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.department.id = :departmentId AND u.role = :role")
    List<User> findByDepartmentIdAndRole(@Param("departmentId") Long departmentId, @Param("role") User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.isActive = true AND (u.firstName LIKE %:search% OR u.lastName LIKE %:search% OR u.employeeId LIKE %:search%)")
    List<User> searchActiveUsers(@Param("search") String search);
}