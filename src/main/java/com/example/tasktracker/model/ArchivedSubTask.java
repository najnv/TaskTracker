package com.example.tasktracker.model;

import com.example.tasktracker.model.ArchivedTask;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "archived_subtasks")
public class ArchivedSubTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private boolean done;

    @ManyToOne
    @JoinColumn(name="archived_task_id")
    @JsonIgnore
    private ArchivedTask task;
}
