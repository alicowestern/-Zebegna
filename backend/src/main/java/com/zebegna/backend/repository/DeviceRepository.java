package com.zebegna.backend.repository;

import com.zebegna.backend.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {

  // Get all non-deleted devices
  List<Device> findByIsDeletedFalseOrderByCreatedAtDesc();

  @Query("SELECT d FROM Device d WHERE d.isDeleted = false AND " +
      "(d.verificationStatus = 'PENDING' OR " +
      "(d.verificationStatus IN ('APPROVED', 'MANUAL') AND d.verificationDate >= :cutoff)) " +
      "ORDER BY d.createdAt DESC")
  List<Device> findActiveDevices(LocalDateTime cutoff);

  // Search by serial number or owner name
  @Query("""
          SELECT d FROM Device d
          LEFT JOIN d.person p
          WHERE d.isDeleted = false
            AND (
              LOWER(d.serialNumber) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(d.deviceName) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
            )
          ORDER BY d.createdAt DESC
      """)
  List<Device> searchDevices(@Param("search") String search);

  // Check serial number uniqueness (excluding current device on edit)
  boolean existsBySerialNumberAndIsDeletedFalse(String serialNumber);

  @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Device d WHERE d.serialNumber = :serial AND d.isDeleted = false AND d.id <> :id")
  boolean existsBySerialNumberAndIdNot(@Param("serial") String serialNumber, @Param("id") Long id);

  Optional<Device> findByIdAndIsDeletedFalse(Long id);

  // Autocomplete suggestions for serial numbers
  @Query("SELECT d.serialNumber FROM Device d WHERE LOWER(d.serialNumber) LIKE LOWER(CONCAT(:prefix, '%')) AND d.isDeleted = false")
  List<String> findSerialSuggestions(@Param("prefix") String prefix);

  // Find devices that were approved/manually verified more than N minutes ago
  // so a scheduler can reset them back to PENDING for the next exit
  @Query("SELECT d FROM Device d WHERE d.isDeleted = false " +
      "AND d.verificationStatus IN ('APPROVED', 'MANUAL') " +
      "AND d.verificationDate < :cutoff")
  List<Device> findStaleVerifiedDevices(@Param("cutoff") LocalDateTime cutoff);
}
