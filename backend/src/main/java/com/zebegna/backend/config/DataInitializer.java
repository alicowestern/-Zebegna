package com.zebegna.backend.config;

import com.zebegna.backend.entity.User;
import com.zebegna.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.findByUsername("admin").isPresent()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Administrator");
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println("Admin user created with new password hashing.");
        } else {
            User admin = userRepository.findByUsername("admin").get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            System.out.println("Admin user password reset to admin123.");
        }

        if (!userRepository.findByUsername("officer1").isPresent()) {
            User officer1 = new User();
            officer1.setUsername("officer1");
            officer1.setPassword(passwordEncoder.encode("officer123"));
            officer1.setFullName("Gate Officer One");
            officer1.setRole(User.Role.GATE_OFFICER);
            officer1.setActive(true);
            userRepository.save(officer1);
            System.out.println("Officer1 user created with new password hashing.");
        } else {
            User officer1 = userRepository.findByUsername("officer1").get();
            officer1.setPassword(passwordEncoder.encode("officer123"));
            userRepository.save(officer1);
            System.out.println("Officer1 password reset to officer123.");
        }
    }
}
