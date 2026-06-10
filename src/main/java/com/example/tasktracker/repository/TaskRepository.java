package com.example.tasktracker.repository;

import com.example.tasktracker.model.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskItem, Long> {
    Long id(Long id);
}
