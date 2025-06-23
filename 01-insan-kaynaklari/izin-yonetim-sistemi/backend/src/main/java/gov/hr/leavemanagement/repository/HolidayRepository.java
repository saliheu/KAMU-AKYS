package gov.hr.leavemanagement.repository;

import gov.hr.leavemanagement.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    
    List<Holiday> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT h FROM Holiday h WHERE YEAR(h.date) = :year ORDER BY h.date")
    List<Holiday> findByYear(@Param("year") int year);
    
    boolean existsByDate(LocalDate date);
    
    @Query("SELECT COUNT(h) FROM Holiday h WHERE h.date BETWEEN :startDate AND :endDate")
    Long countHolidaysBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}