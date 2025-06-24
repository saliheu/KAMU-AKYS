package gov.citizen.complaintmanagement.repository;

import gov.citizen.complaintmanagement.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Citizen entity
 * Vatandaş entity repository arayüzü
 */
@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {

    Optional<Citizen> findByNationalId(String nationalId);

    Optional<Citizen> findByEmail(String email);

    boolean existsByNationalId(String nationalId);

    boolean existsByEmail(String email);

    Optional<Citizen> findByPhoneNumber(String phoneNumber);
}