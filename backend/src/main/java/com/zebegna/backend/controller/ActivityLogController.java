package com.zebegna.backend.controller;

import com.zebegna.backend.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LogDto>> getLogs(@RequestParam(defaultValue = "100") int limit) {
        List<LogDto> logs = activityLogRepository
                .findAllByOrderByTimestampDesc(PageRequest.of(0, Math.min(limit, 500)))
                .stream()
                .map(log -> new LogDto(
                        log.getId(),
                        log.getUser() != null ? log.getUser().getFullName() : "System",
                        log.getUser() != null ? log.getUser().getUsername() : "system",
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getDetails(),
                        log.getTimestamp()))
                .toList();
        return ResponseEntity.ok(logs);
    }

    public record LogDto(
            Long id,
            String performedBy,
            String username,
            String action,
            String entityType,
            Long entityId,
            String details,
            LocalDateTime timestamp) {
    }
}
