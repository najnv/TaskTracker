package com.example.tasktracker.controller;

import com.example.tasktracker.model.SubTask;
import com.example.tasktracker.model.Tag;
import com.example.tasktracker.model.TaskItem;
import com.example.tasktracker.repository.SubTaskRepository;
import com.example.tasktracker.repository.TagRepository;
import com.example.tasktracker.repository.TaskRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final SubTaskRepository subTaskRepository;
    private final TagRepository tagRepository;

    public TaskController(TaskRepository taskRepository, SubTaskRepository subTaskRepository, TagRepository tagRepository) {
        this.taskRepository = taskRepository;
        this.subTaskRepository = subTaskRepository;
        this.tagRepository = tagRepository;
    }

    @GetMapping
    public List <TaskItem> getAllTasks(
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = order.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortBy);
        return taskRepository.findAll(sort);
    }

    @PostMapping
    public TaskItem createTask (@Valid @RequestBody TaskItem task) {
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
    public ResponseEntity<?> deleteTask (@PathVariable Long id) {
        TaskItem task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Задача не найдена"));
        if (!task.isDone()){
            return ResponseEntity.badRequest().body("можно удалить только выполненные задачи");
        }
        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskItem> updateTask(@PathVariable Long id, @Valid @RequestBody TaskItem updatedTask){
        System.out.println("Updating task " + id + " with done=" + updatedTask.isDone() + ", title =" + updatedTask.getTitle());
        return taskRepository.findById(id)
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDone(updatedTask.isDone());
                    TaskItem savedTask = taskRepository.save(task);
                    System.out.println("SavedTask "+ savedTask.getTitle() + " with done=" + savedTask.isDone());
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
    public ResponseEntity<TaskItem> setTaskTags(@PathVariable Long id, @RequestBody Set<Long> tagIds) {
        return taskRepository.findById(id)
                .map(task->{
                    Set<Tag> tags = new HashSet<>(tagRepository.findAllById(tagIds));
                    task.setTags(tags);
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{taskId}/tags/{tagId}")
    public ResponseEntity<TaskItem> removeTagFromTask(@PathVariable Long taskId, @PathVariable Long tagId) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    task.getTags().removeIf(tag -> tag.getId().equals(tagId));
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}