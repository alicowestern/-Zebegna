package com.zebegna.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "device_name")
    private String deviceName;

    @Column(nullable = false, name = "device_type")
    private String deviceType;

    @Column(nullable = false, unique = true, name = "serial_number")
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id")
    private Person person;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Reason reason = Reason.WORK;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "supporting_document")
    private String supportingDocument;

    @Column(name = "registration_date")
    private LocalDateTime registrationDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "verification_status")
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verification_date")
    private LocalDateTime verificationDate;

    @Builder.Default
    @Column(nullable = false, name = "is_deleted")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (registrationDate == null)
            registrationDate = LocalDateTime.now();
    }

    public enum Reason {
        WORK, REWARD, OTHER
    }

    public enum VerificationStatus {
        PENDING, APPROVED, MANUAL
    }
}
