package com.example.tasktracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name="tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message="Название тега не должно быть пустым")
    @Column(unique = true)
    private String name;

    @ManyToMany(mappedBy = "tags")
    @JsonIgnore
    private Set<TaskItem> tasks = new HashSet<>();
}
