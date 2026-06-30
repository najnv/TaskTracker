package com.example.tasktracker.service;

import com.example.tasktracker.repository.ArchivedTaskRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ArchiveService {
    private final ArchivedTaskRepository archivedTaskRepository;

    public ArchiveService(ArchivedTaskRepository archivedTaskRepository) {
        this.archivedTaskRepository = archivedTaskRepository;
    }

    @Scheduled(cron = "0 * * * * *")
    public void clearExpiredArchivedTask() {
        archivedTaskRepository.deleteAll(archivedTaskRepository.findByExpiresAtIsNotNullAndExpiresAtBefore(LocalDateTime.now()));
    }
}