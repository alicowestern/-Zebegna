package com.zebegna.backend.dto;

import com.zebegna.backend.entity.Device;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DeviceResponse {
    private Long id;
    private String deviceName;
    private String deviceType;
    private String serialNumber;
    private Long personId;
    private String ownerName;
    private String ownerType;
    private String ownerDepartment;
    private String reason;
    private String notes;
    private String supportingDocument;
    private LocalDateTime registrationDate;
    private String verificationStatus;
    private String verifiedBy;
    private LocalDateTime verificationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DeviceResponse from(Device d) {
        return DeviceResponse.builder()
                .id(d.getId())
                .deviceName(d.getDeviceName())
                .deviceType(d.getDeviceType())
                .serialNumber(d.getSerialNumber())
                .personId(d.getPerson() != null ? d.getPerson().getId() : null)
                .ownerName(d.getPerson() != null ? d.getPerson().getFullName() : null)
                .ownerType(d.getPerson() != null ? d.getPerson().getType().name() : null)
                .ownerDepartment(d.getPerson() != null ? d.getPerson().getDepartment() : null)
                .reason(d.getReason().name())
                .notes(d.getNotes())
                .supportingDocument(d.getSupportingDocument())
                .registrationDate(d.getRegistrationDate())
                .verificationStatus(d.getVerificationStatus().name())
                .verifiedBy(d.getVerifiedBy() != null ? d.getVerifiedBy().getFullName() : null)
                .verificationDate(d.getVerificationDate())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
