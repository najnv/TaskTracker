package com.example.tasktracker.controller;

import com.example.tasktracker.model.Tag;
import com.example.tasktracker.model.TaskItem;
import com.example.tasktracker.repository.TagRepository;
import com.example.tasktracker.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagRepository tagRepository;
    private final TaskRepository taskRepository;

    public TagController(TagRepository tagRepository, TaskRepository taskRepository) {
        this.tagRepository = tagRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<Tag> getAllTags()
    {
        return tagRepository.findAll();
    }

    @PostMapping
    public Tag createTag(@Valid @RequestBody Tag tag){
        tag.setId(null);
        if(tagRepository.existsByNameIgnoreCase(tag.getName())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Тэг с таким названием уже существует");
        }
        return tagRepository.save(tag);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteTag(@PathVariable Long id){
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тег не найден"));
        for(TaskItem task : tag.getTasks()){
            task.getTags().remove(tag);
            taskRepository.save(task);
        }
        tagRepository.delete(tag);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tag> updateTag (@PathVariable Long id, @Valid @RequestBody Tag updatedTag){
        Tag tag = tagRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тег с id " + id + " не найден"));
        if(tagRepository.existsByNameIgnoreCaseAndIdNot(updatedTag.getName(), id)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Тег с таким названием уже существует");
        }
        tag.setName(updatedTag.getName());
        return ResponseEntity.ok(tagRepository.save(tag));
    }
}
