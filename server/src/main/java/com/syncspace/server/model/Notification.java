package com.syncspace.server.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_read")
    private boolean read = false;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType {
        MENTION, INVITE, TASK_ASSIGNED, MESSAGE
    }
}