package com.example.tasktracker.dto.request;

import com.example.tasktracker.enums.ArchiveRetention;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ArchiveRetentionRequest {
    private ArchiveRetention retention;
}
