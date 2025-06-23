package gov.hr.leavemanagement.repository;

import gov.hr.leavemanagement.entity.LeaveRequest;
import gov.hr.leavemanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    Page<LeaveRequest> findByUser(User user, Pageable pageable);
    
    Page<LeaveRequest> findByUserAndStatus(User user, LeaveRequest.LeaveStatus status, Pageable pageable);
    
    List<LeaveRequest> findByUserAndStatusIn(User user, List<LeaveRequest.LeaveStatus> statuses);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.user.manager.id = :managerId AND lr.status = :status")
    Page<LeaveRequest> findPendingRequestsForManager(@Param("managerId") Long managerId, 
                                                     @Param("status") LeaveRequest.LeaveStatus status, 
                                                     Pageable pageable);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.user.id = :userId AND " +
           "((lr.startDate <= :endDate AND lr.endDate >= :startDate) AND lr.status IN :statuses)")
    List<LeaveRequest> findOverlappingRequests(@Param("userId") Long userId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate,
                                               @Param("statuses") List<LeaveRequest.LeaveStatus> statuses);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE YEAR(lr.startDate) = :year AND lr.user.id = :userId AND lr.status = 'APPROVED'")
    List<LeaveRequest> findApprovedRequestsByUserAndYear(@Param("userId") Long userId, @Param("year") int year);
    
    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.user.department.id = :departmentId " +
           "AND lr.status = 'APPROVED' AND lr.startDate <= :date AND lr.endDate >= :date")
    Long countEmployeesOnLeaveByDepartmentAndDate(@Param("departmentId") Long departmentId, @Param("date") LocalDate date);
}