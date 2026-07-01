package com.example.tasktracker.repository;
import com.example.tasktracker.model.Tag;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;


public interface TagRepository extends JpaRepository<Tag, Long> {

    boolean existsByNameIgnoreCaseAndIdNot(@NotBlank String name, Long id);

    boolean existsByNameIgnoreCase(@NotBlank String name);
}