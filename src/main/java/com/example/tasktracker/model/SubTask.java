package com.example.tasktracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SubTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название подзадачи не должно быть пустым")
    private String title;

    private boolean done;

    @ManyToOne
    @JoinColumn(name = "task_id")
    @JsonIgnore
    private TaskItem task;
}
