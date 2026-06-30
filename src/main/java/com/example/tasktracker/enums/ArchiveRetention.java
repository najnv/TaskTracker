package com.example.tasktracker.enums;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public enum ArchiveRetention {

    HOUR("1 час"),
    DAY("1 день"),
    WEEK("1 неделя"),
    MONTH("1 месяц"),
    NEVER("Не удалять");

    private final String displayName;

    ArchiveRetention(String displayName) {
        this.displayName = displayName;
    }

    public LocalDateTime calculateExpiration(LocalDateTime deletedAt){
        if(this == HOUR){
            return deletedAt.plusHours(1);
        }
        if (this == DAY){
            return deletedAt.plusDays(1);
        }
        if (this == WEEK){
            return deletedAt.plusWeeks(1);
        }
        if (this == MONTH){
            return deletedAt.plusMonths(1);
        }
        return null;
    }
}
