package com.example.tasktracker.model;

import com.example.tasktracker.enums.ArchiveRetention;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "archived_tasks")
public class ArchivedTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private boolean done;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime deletedAt;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime expiresAt;

    @JsonProperty("expiresTimestamp")
    public Long getExpiresTimestamp() {
        if (expiresAt == null) {
            return null;
        }
        return expiresAt
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
    }

    @JsonProperty("deletedTimestamp")
    public long getDeletedTimestamp() {
        if (deletedAt == null) {
            return 0;
        }
        return deletedAt
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
    }

    @Enumerated(EnumType.STRING)
    private ArchiveRetention retention = ArchiveRetention.HOUR;

    @OneToMany(
            mappedBy ="task",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ArchivedSubTask> subTasks = new ArrayList<>();

    @ManyToMany
    @JoinTable(
          name = "archived_task_tag",
          joinColumns = @JoinColumn(name = "archived_task_id"),
          inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();
}
