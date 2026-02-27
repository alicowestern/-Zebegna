package com.zebegna.backend.controller;

import com.zebegna.backend.dto.DeviceRequest;
import com.zebegna.backend.dto.DeviceResponse;
import com.zebegna.backend.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    // GET /api/devices?search=...
    @GetMapping
    public ResponseEntity<List<DeviceResponse>> getDevices(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(deviceService.getDevices(search));
    }

    // GET /api/devices/suggestions?prefix=...
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(
            @RequestParam(defaultValue = "") String prefix) {
        return ResponseEntity.ok(deviceService.getSerialSuggestions(prefix));
    }

    // POST /api/devices
    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('GATE_OFFICER')")
    public ResponseEntity<DeviceResponse> register(
            @Valid @RequestBody DeviceRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        DeviceResponse response = deviceService.registerDevice(req, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT /api/devices/{id}
    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('GATE_OFFICER')")
    public ResponseEntity<DeviceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DeviceRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(deviceService.updateDevice(id, req, principal.getUsername()));
    }

    // DELETE /api/devices/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        deviceService.deleteDevice(id, principal.getUsername());
        return ResponseEntity.ok(Map.of("message", "Device deleted successfully"));
    }

    // POST /api/devices/{id}/verify (Approve Exit)
    @PostMapping("/{id}/verify")
    public ResponseEntity<DeviceResponse> approveExit(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(deviceService.approveExit(id, principal.getUsername()));
    }

    // POST /api/devices/{id}/manual-verification
    @PostMapping("/{id}/manual-verification")
    public ResponseEntity<DeviceResponse> manualVerification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(deviceService.manualVerification(id, principal.getUsername()));
    }
}
