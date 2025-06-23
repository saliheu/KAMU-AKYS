package gov.hr.leavemanagement.repository;

import gov.hr.leavemanagement.entity.LeaveBalance;
import gov.hr.leavemanagement.entity.LeaveRequest;
import gov.hr.leavemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    
    List<LeaveBalance> findByUserAndYear(User user, Integer year);
    
    Optional<LeaveBalance> findByUserAndYearAndLeaveType(User user, Integer year, LeaveRequest.LeaveType leaveType);
    
    List<LeaveBalance> findByUser(User user);
}