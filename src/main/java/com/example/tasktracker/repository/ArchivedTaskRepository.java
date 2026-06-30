package com.example.tasktracker.repository;

import com.example.tasktracker.model.ArchivedTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ArchivedTaskRepository extends JpaRepository<ArchivedTask, Long> {

    List<ArchivedTask> findByExpiresAtIsNotNullAndExpiresAtBefore(LocalDateTime time);

}