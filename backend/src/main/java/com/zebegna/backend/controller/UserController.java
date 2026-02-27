package com.zebegna.backend.controller;

import com.zebegna.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserService.UserDto>> getAllOfficers() {
        return ResponseEntity.ok(userService.getAllOfficers());
    }

    @PostMapping
    public ResponseEntity<UserService.UserDto> createOfficer(@RequestBody UserService.CreateUserDto req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createOfficer(req));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        userService.resetPassword(id, body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<Map<String, String>> toggleActive(@PathVariable Long id) {
        userService.toggleActiveStatus(id);
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }
}
