package com.example.tasktracker.controller;

import com.example.tasktracker.model.TaskItem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final List<TaskItem> tasks = new ArrayList<>();
    private long nextId = 1;

    @GetMapping
    public List <TaskItem> getAllTasks() {
        return tasks;
    }

    @PostMapping
    public TaskItem createTask (@RequestBody TaskItem task) {
        task.setId(nextId++);
        tasks.add(task);
        return task;
    }

    @DeleteMapping ("/{id}")
    public ResponseEntity<Void> deleteTask (@PathVariable long id) {
        boolean removed = tasks.removeIf(task -> task.getId().equals(id));
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
