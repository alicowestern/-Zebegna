package com.zebegna.backend.service;

import com.zebegna.backend.entity.Device;
import com.zebegna.backend.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task that resets APPROVED/MANUAL devices back to PENDING
 * after 10 minutes. This allows the same device to be approved again
 * on the next exit (second exit scenario).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceStatusScheduler {

    private final DeviceRepository deviceRepository;

    // Runs every 60 seconds
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void resetStaleApprovedDevices() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
        List<Device> staleDevices = deviceRepository.findStaleVerifiedDevices(cutoff);

        if (!staleDevices.isEmpty()) {
            log.info("Resetting {} stale device(s) from APPROVED/MANUAL back to PENDING", staleDevices.size());
            for (Device device : staleDevices) {
                device.setVerificationStatus(Device.VerificationStatus.PENDING);
                // Clear verifiedBy and verificationDate so next officer sees a fresh PENDING
                device.setVerifiedBy(null);
                device.setVerificationDate(null);
            }
            deviceRepository.saveAll(staleDevices);
        }
    }
}
