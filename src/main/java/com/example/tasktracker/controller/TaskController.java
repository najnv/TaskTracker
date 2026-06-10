package com.example.tasktracker.controller;

import com.example.tasktracker.model.SubTask;
import com.example.tasktracker.model.TaskItem;
import com.example.tasktracker.repository.SubTaskRepository;
import com.example.tasktracker.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final SubTaskRepository subTaskRepository;

    public TaskController(TaskRepository taskRepository, SubTaskRepository subTaskRepository) {
        this.taskRepository = taskRepository;
        this.subTaskRepository = subTaskRepository;
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

    @PutMapping("/{id}")
    public ResponseEntity<TaskItem> updateTask(@PathVariable Long id, @Valid @RequestBody TaskItem updatedTask){
        return taskRepository.findById(id)
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDone(updatedTask.isDone());
                    task.setTags(updatedTask.getTags());
                    TaskItem savedTask = taskRepository.save(task);
                    return ResponseEntity.ok(savedTask);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{taskId}/subtasks")
    public ResponseEntity<TaskItem> addSubTask(@PathVariable Long taskId,@Valid @RequestBody SubTask subTask) {
        return taskRepository.findById(taskId)
                .map(task->{
                    subTask.setId(null);
                    subTask.setTask(task);
                    task.getSubTasks().add(subTask);
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{taskId}/subtasks/{subTaskId}/toggle")
    public ResponseEntity<SubTask> toggleSubTask(@PathVariable Long taskId,@PathVariable Long subTaskId) {
        return subTaskRepository.findById(subTaskId)
                .filter(subTask -> subTask.getTask().getId().equals(taskId))
                .map(subTask->{
                    subTask.setDone(!subTask.isDone());
                    return ResponseEntity.ok(subTaskRepository.save(subTask));
        })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{taskId}/subtasks/{subTaskId}")
    public ResponseEntity<Void> deleteSubTask(@PathVariable Long taskId,@PathVariable Long subTaskId) {
        return subTaskRepository.findById(subTaskId)
                .filter(subTask -> subTask.getTask().getId().equals(taskId))
                .map(subTask -> {
                    subTaskRepository.delete(subTask);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/tags")
    public ResponseEntity<TaskItem> updateTags(@PathVariable Long id, @RequestBody Set<String> tags) {

        return taskRepository.findById(id)
                .map(task->{
                    task.setTags(tags);
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
