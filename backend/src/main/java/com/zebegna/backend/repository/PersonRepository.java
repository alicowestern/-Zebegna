package com.zebegna.backend.repository;

import com.zebegna.backend.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PersonRepository extends JpaRepository<Person, Long> {

    @Query("SELECT p FROM Person p WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%')) AND p.active = true")
    List<Person> searchByName(@Param("search") String search);

    List<Person> findByActiveTrue();
}
