package gov.citizen.complaintmanagement.repository;

import gov.citizen.complaintmanagement.entity.Complaint;
import gov.citizen.complaintmanagement.entity.ComplaintStatus;
import gov.citizen.complaintmanagement.entity.ComplaintType;
import gov.citizen.complaintmanagement.entity.PriorityLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Complaint entity
 * Şikayet entity repository arayüzü
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByComplaintNumber(String complaintNumber);

    Page<Complaint> findByCitizenId(Long citizenId, Pageable pageable);

    Page<Complaint> findByAssignedDepartmentId(Long departmentId, Pageable pageable);

    Page<Complaint> findByAssignedOfficerId(Long officerId, Pageable pageable);

    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);

    Page<Complaint> findByPriority(PriorityLevel priority, Pageable pageable);

    Page<Complaint> findByType(ComplaintType type, Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:type IS NULL OR c.type = :type) AND " +
           "(:departmentId IS NULL OR c.assignedDepartment.id = :departmentId) AND " +
           "(:officerId IS NULL OR c.assignedOfficer.id = :officerId) AND " +
           "(:citizenId IS NULL OR c.citizen.id = :citizenId) AND " +
           "(:startDate IS NULL OR c.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR c.createdAt <= :endDate)")
    Page<Complaint> findByFilters(@Param("status") ComplaintStatus status,
                                  @Param("priority") PriorityLevel priority,
                                  @Param("type") ComplaintType type,
                                  @Param("departmentId") Long departmentId,
                                  @Param("officerId") Long officerId,
                                  @Param("citizenId") Long citizenId,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate,
                                  Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(LOWER(c.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.complaintNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Complaint> searchComplaints(@Param("keyword") String keyword, Pageable pageable);

    List<Complaint> findByStatusAndExpectedResolutionDateBefore(ComplaintStatus status, LocalDateTime date);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    Long countByStatus(@Param("status") ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.createdAt >= :startDate AND c.createdAt <= :endDate")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(c.satisfactionRating) FROM Complaint c WHERE c.satisfactionRating IS NOT NULL")
    Double getAverageSatisfactionRating();

    @Query("SELECT c.type, COUNT(c) FROM Complaint c GROUP BY c.type")
    List<Object[]> getComplaintCountByType();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> getComplaintCountByStatus();

    @Query("SELECT c.assignedDepartment.name, COUNT(c) FROM Complaint c WHERE c.assignedDepartment IS NOT NULL GROUP BY c.assignedDepartment.name")
    List<Object[]> getComplaintCountByDepartment();
}