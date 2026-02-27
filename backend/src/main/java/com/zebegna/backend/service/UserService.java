package com.zebegna.backend.service;

import com.zebegna.backend.entity.User;
import com.zebegna.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto> getAllOfficers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.GATE_OFFICER)
                .map(u -> new UserDto(u.getId(), u.getUsername(), u.getFullName(), u.isActive()))
                .collect(Collectors.toList());
    }

    public UserDto createOfficer(CreateUserDto req) {
        if (userRepository.findByUsername(req.username()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = User.builder()
                .username(req.username())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .role(User.Role.GATE_OFFICER)
                .active(true)
                .build();
        @SuppressWarnings("null")
        User savedUser = userRepository.save(user);
        return new UserDto(savedUser.getId(), savedUser.getUsername(), savedUser.getFullName(), savedUser.isActive());
    }

    public void resetPassword(Long id, String newPassword) {
        @SuppressWarnings("null")
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void toggleActiveStatus(Long id) {
        @SuppressWarnings("null")
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    public record UserDto(Long id, String username, String fullName, Boolean active) {
    }

    public record CreateUserDto(String username, String password, String fullName) {
    }
}
