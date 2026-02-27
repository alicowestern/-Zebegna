package com.zebegna.backend.dto;

import com.zebegna.backend.entity.Device;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeviceRequest {

    @NotBlank(message = "Device name is required")
    private String deviceName;

    @NotBlank(message = "Device type is required")
    private String deviceType;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    // Owner info (can be existing person ID or new person details)
    private Long personId;
    private String ownerName;
    private String ownerIdentifier;
    private String ownerType; // EMPLOYEE or GUEST
    private String ownerDepartment;

    @NotNull(message = "Reason is required")
    private Device.Reason reason;

    private String notes;
    private String supportingDocument;
}
