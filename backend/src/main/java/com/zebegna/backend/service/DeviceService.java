package com.zebegna.backend.service;

import com.zebegna.backend.dto.DeviceRequest;
import com.zebegna.backend.dto.DeviceResponse;
import com.zebegna.backend.entity.*;
import com.zebegna.backend.exception.ResourceNotFoundException;
import com.zebegna.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceService {

        private final DeviceRepository deviceRepository;
        private final PersonRepository personRepository;
        private final UserRepository userRepository;
        private final ActivityLogRepository activityLogRepository;

        // ── List / Search ────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public List<DeviceResponse> getDevices(String search) {
                List<Device> devices;
                if (search == null || search.isBlank()) {
                        // Hide approved devices older than 10 minutes from the main view
                        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
                        devices = deviceRepository.findActiveDevices(cutoff);
                } else {
                        devices = deviceRepository.searchDevices(search.trim());
                }
                return devices.stream().map(DeviceResponse::from).collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<String> getSerialSuggestions(String prefix) {
                if (prefix == null || prefix.length() < 2)
                        return List.of();
                return deviceRepository.findSerialSuggestions(prefix);
        }

        // ── Register ────────────────────────────────────────────────────────────

        public DeviceResponse registerDevice(DeviceRequest req, String actorUsername) {
                // Validate unique serial
                if (deviceRepository.existsBySerialNumberAndIsDeletedFalse(req.getSerialNumber())) {
                        throw new IllegalArgumentException(
                                        "Serial number already registered: " + req.getSerialNumber());
                }

                Person person = resolveOrCreatePerson(req);

                Device device = Device.builder()
                                .deviceName(req.getDeviceName())
                                .deviceType(req.getDeviceType())
                                .serialNumber(req.getSerialNumber().trim())
                                .person(person)
                                .reason(req.getReason())
                                .notes(req.getNotes())
                                .supportingDocument(req.getSupportingDocument())
                                .registrationDate(LocalDateTime.now())
                                .verificationStatus(Device.VerificationStatus.PENDING)
                                .isDeleted(false)
                                .build();

                @SuppressWarnings("null")
                Device savedDevice = deviceRepository.save(device);
                logAction(actorUsername, "REGISTER_DEVICE", "Device", savedDevice.getId(),
                                "Registered device: " + savedDevice.getSerialNumber());
                return DeviceResponse.from(savedDevice);
        }

        // ── Edit ────────────────────────────────────────────────────────────────

        public DeviceResponse updateDevice(Long id, DeviceRequest req, String actorUsername) {
                Device device = deviceRepository.findByIdAndIsDeletedFalse(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + id));

                // Check serial uniqueness (excluding this device)
                if (!device.getSerialNumber().equals(req.getSerialNumber()) &&
                                deviceRepository.existsBySerialNumberAndIdNot(req.getSerialNumber(), id)) {
                        throw new IllegalArgumentException("Serial number already in use: " + req.getSerialNumber());
                }

                Person person = resolveOrCreatePerson(req);

                device.setDeviceName(req.getDeviceName());
                device.setDeviceType(req.getDeviceType());
                device.setSerialNumber(req.getSerialNumber().trim());
                device.setPerson(person);
                device.setReason(req.getReason());
                device.setNotes(req.getNotes());
                device.setSupportingDocument(req.getSupportingDocument());

                device = deviceRepository.save(device);
                logAction(actorUsername, "EDIT_DEVICE", "Device", device.getId(),
                                "Updated device: " + device.getSerialNumber());
                return DeviceResponse.from(device);
        }

        // ── Soft Delete ─────────────────────────────────────────────────────────

        public void deleteDevice(Long id, String actorUsername) {
                Device device = deviceRepository.findByIdAndIsDeletedFalse(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + id));
                device.setIsDeleted(true);
                deviceRepository.save(device);
                logAction(actorUsername, "DELETE_DEVICE", "Device", id,
                                "Soft-deleted device: " + device.getSerialNumber());
        }

        // ── Approve Exit ─────────────────────────────────────────────────────────
        // Exit approval is a repeatable event (a person can exit multiple times per
        // day).
        // We log the approval and record who approved it, then reset status to PENDING
        // so the same device can be approved again on the next exit.

        public DeviceResponse approveExit(Long id, String actorUsername) {
                Device device = deviceRepository.findByIdAndIsDeletedFalse(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + id));

                User actor = userRepository.findByUsername(actorUsername)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + actorUsername));

                // Set to APPROVED so the gate officer can see it was approved.
                // A scheduled task will reset to PENDING after 10 minutes for the next exit.
                device.setVerifiedBy(actor);
                device.setVerificationDate(LocalDateTime.now());
                device.setVerificationStatus(Device.VerificationStatus.APPROVED);
                device = deviceRepository.save(device);

                logAction(actorUsername, "APPROVE_EXIT", "Device", id,
                                "Exit approved for device: " + device.getSerialNumber() + " by " + actorUsername);
                return DeviceResponse.from(device);
        }

        // ── Manual Verification ──────────────────────────────────────────────────
        // Same logic: manual verification is also a repeatable event, reset to PENDING
        // after logging.

        public DeviceResponse manualVerification(Long id, String actorUsername) {
                Device device = deviceRepository.findByIdAndIsDeletedFalse(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + id));

                User actor = userRepository.findByUsername(actorUsername)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + actorUsername));

                // Set to MANUAL so the gate officer can see it was manually verified.
                // A scheduled task will reset to PENDING after 10 minutes for the next exit.
                device.setVerifiedBy(actor);
                device.setVerificationDate(LocalDateTime.now());
                device.setVerificationStatus(Device.VerificationStatus.MANUAL);
                device = deviceRepository.save(device);

                logAction(actorUsername, "MANUAL_VERIFICATION", "Device", id,
                                "Manual verification for device: " + device.getSerialNumber() + " by " + actorUsername);
                return DeviceResponse.from(device);
        }

        // ── Helpers ──────────────────────────────────────────────────────────────

        private Person resolveOrCreatePerson(DeviceRequest req) {
                if (req.getPersonId() != null) {
                        Long personId = java.util.Objects.requireNonNull(req.getPersonId());
                        return personRepository.findById(personId)
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Person not found: " + personId));
                }
                if (req.getOwnerName() != null && !req.getOwnerName().isBlank()) {
                        Person person = Person.builder()
                                        .fullName(req.getOwnerName().trim())
                                        .identifier(req.getOwnerIdentifier())
                                        .type(req.getOwnerType() != null
                                                        ? Person.Type.valueOf(req.getOwnerType().toUpperCase())
                                                        : Person.Type.EMPLOYEE)
                                        .department(req.getOwnerDepartment())
                                        .active(true)
                                        .build();
                        @SuppressWarnings("null")
                        Person savedPerson = personRepository.save(person);
                        return java.util.Objects.requireNonNull(savedPerson);
                }
                return null;
        }

        private void logAction(String username, String action, String entityType, Long entityId, String details) {
                userRepository.findByUsername(username).ifPresent(user -> {
                        ActivityLog log = ActivityLog.builder()
                                        .user(user)
                                        .action(action)
                                        .entityType(entityType)
                                        .entityId(entityId)
                                        .details(details)
                                        .build();
                        @SuppressWarnings("null")
                        ActivityLog savedLog = activityLogRepository.save(log);
                        java.util.Objects.requireNonNull(savedLog);
                });
        }
}
