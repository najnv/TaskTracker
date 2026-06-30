package com.example.tasktracker.controller;


import com.example.tasktracker.dto.request.ArchiveRetentionRequest;
import com.example.tasktracker.enums.ArchiveRetention;
import com.example.tasktracker.model.*;
import com.example.tasktracker.repository.ArchivedTaskRepository;
import com.example.tasktracker.repository.TaskRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/archive")
public class ArchiveController {

    private final ArchivedTaskRepository archivedTaskRepository;
    private final TaskRepository taskRepository;

    public ArchiveController(ArchivedTaskRepository archivedTaskRepository, TaskRepository taskRepository) {
        this.archivedTaskRepository = archivedTaskRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<ArchivedTask> getArchive() {
        return archivedTaskRepository.findAll(
                Sort.by(Sort.Direction.DESC, "deletedAt")
        );
    }

    @PostMapping("/{id}/restore")
    @Transactional
    public ResponseEntity<TaskItem> restore(@PathVariable Long id) {
        ArchivedTask archivedTask = archivedTaskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Архивная задача с id " + id + " не найдена"));
        TaskItem taskItem = new TaskItem();
        taskItem.setTitle(archivedTask.getTitle());
        taskItem.setDone(archivedTask.isDone());
        taskItem.setCreatedAt(archivedTask.getCreatedAt());
        taskItem.setTags(new HashSet<>(archivedTask.getTags()));

        for (ArchivedSubTask sub : archivedTask.getSubTasks()) {
            SubTask subTask = new SubTask();

            subTask.setTitle(sub.getTitle());
            subTask.setDone(sub.isDone());
            subTask.setTask(taskItem);

            taskItem.getSubTasks().add(subTask);
        }

        TaskItem savedTask = taskRepository.save(taskItem);
        archivedTaskRepository.delete(archivedTask);
        return ResponseEntity.ok(savedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForever(@PathVariable Long id) {
        ArchivedTask archivedTask = archivedTaskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Задача c id " + id + " не найдена"));
        archivedTaskRepository.delete(archivedTask);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clear() {
        archivedTaskRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/retention")
    @Transactional
    public ResponseEntity<ArchivedTask> changeRetentionTime(@PathVariable Long id, @RequestBody ArchiveRetentionRequest request) {
        ArchivedTask archivedTask = archivedTaskRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Архивная задача с id " + id + " не найдена"));
        ArchiveRetention retention = request.getRetention();

        if (retention == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Не указан срок хранения");
        }

        archivedTask.setRetention(retention);
        archivedTask.setExpiresAt(retention.calculateExpiration(archivedTask.getDeletedAt()));
        ArchivedTask saved = archivedTaskRepository.save(archivedTask);
        return ResponseEntity.ok(saved);
    }

}
