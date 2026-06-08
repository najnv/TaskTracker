package com.example.tasktracker.controller;

import com.example.tasktracker.model.TaskItem;
import com.example.tasktracker.repository.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository){
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List <TaskItem> getAllTasks() {
        return taskRepository.findAll();
    }

    @PostMapping
    public TaskItem createTask (@RequestBody TaskItem task) {
        task.setId(null);
        return taskRepository.save(task);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskItem> getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping ("/{id}")
    public ResponseEntity<Void> deleteTask (@PathVariable Long id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
