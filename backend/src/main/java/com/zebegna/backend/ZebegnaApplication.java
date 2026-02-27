package com.zebegna.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZebegnaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ZebegnaApplication.class, args);
    }
}
