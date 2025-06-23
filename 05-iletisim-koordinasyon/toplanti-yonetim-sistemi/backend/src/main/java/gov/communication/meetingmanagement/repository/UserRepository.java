package gov.communication.meetingmanagement.repository;

import gov.communication.meetingmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    List<User> findByDepartmentId(Long departmentId);
    
    List<User> findByRole(User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.enabled = true AND (u.department.id = :departmentId OR u.department.parent.id = :departmentId)")
    List<User> findActiveUsersByDepartmentOrParentDepartment(@Param("departmentId") Long departmentId);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<User> searchUsers(@Param("search") String search);
}