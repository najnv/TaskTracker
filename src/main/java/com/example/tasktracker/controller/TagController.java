package com.example.tasktracker.controller;

import com.example.tasktracker.model.Tag;
import com.example.tasktracker.repository.TagRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository){
        this.tagRepository = tagRepository;
    }

    @GetMapping
    public List<Tag> getAllTags()
    {
        return tagRepository.findAll();
    }

    @PostMapping
    public Tag createTag(@Valid @RequestBody Tag tag){
        tag.setId(null);
        return tagRepository.save(tag);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id){
        if(!tagRepository.existsById(id)){
            return ResponseEntity.notFound().build();
        }
        tagRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tag> updateTag (@PathVariable Long id, @Valid @RequestBody Tag updatedTag){
        return tagRepository.findById(id)
                .map(tag->{
                    tag.setName(updatedTag.getName());
                    return ResponseEntity.ok(tagRepository.save(tag));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
