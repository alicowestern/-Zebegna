-- V1__init_schema.sql
-- Zebegna Database Schema

-- Users table (Gate Officers and Admins)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'GATE_OFFICER')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Persons table (Employees and Guests who own devices)
CREATE TABLE persons (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    identifier VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('EMPLOYEE', 'GUEST')),
    department VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Devices table (centralized, used by all gate officers)
CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(255) NOT NULL UNIQUE,
    person_id BIGINT REFERENCES persons(id) ON DELETE SET NULL,
    reason VARCHAR(20) NOT NULL DEFAULT 'WORK' CHECK (reason IN ('WORK', 'REWARD', 'OTHER')),
    notes TEXT,
    supporting_document VARCHAR(500),
    registration_date TIMESTAMP NOT NULL DEFAULT NOW(),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'MANUAL')),
    verified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    verification_date TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_devices_serial_number ON devices(serial_number);
CREATE INDEX idx_devices_person_id ON devices(person_id);
CREATE INDEX idx_devices_verification_status ON devices(verification_status);
CREATE INDEX idx_persons_full_name ON persons(full_name);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);

-- Seed default admin user (password: admin123)
INSERT INTO users (username, password, full_name, role, active)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'ADMIN',
    TRUE
);

-- Seed gate officer (password: officer123)
INSERT INTO users (username, password, full_name, role, active)
VALUES (
    'officer1',
    '$2a$10$8K1p/a0dqbQQ8K1p/a0dqlgvJT6Ty9iuH8Y46g6h6OsChbN6WdIm',
    'Gate Officer One',
    'GATE_OFFICER',
    TRUE
);
