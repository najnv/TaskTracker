package com.example.tasktracker.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskItem {
    private Long id;
    private String title;
    private Boolean done;

}
