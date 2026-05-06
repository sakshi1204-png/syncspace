package com.syncspace.server.controller;

import com.syncspace.server.model.Message;
import com.syncspace.server.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(MessageService messageService,
                          SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, Object> payload) {
        String content = (String) payload.get("content");
        Long channelId = Long.valueOf(payload.get("channelId").toString());
        Long senderId = Long.valueOf(payload.get("senderId").toString());
        Message saved = messageService.saveMessage(
            content, channelId, senderId);
        messagingTemplate.convertAndSend(
            "/topic/channel/" + channelId, (Object) toDto(saved));
    }

    @GetMapping("/api/messages/{channelId}")
    public List<Map<String, Object>> getMessages(
            @PathVariable("channelId") Long channelId) {
        return messageService.getChannelMessages(channelId)
            .stream().map(this::toDto).toList();
    }

    private Map<String, Object> toDto(Message msg) {
        Map<String, Object> sender = new HashMap<>();
        sender.put("id", msg.getSender().getId());
        sender.put("name", msg.getSender().getName());
        sender.put("email", msg.getSender().getEmail());

        Map<String, Object> dto = new HashMap<>();
        dto.put("id", msg.getId());
        dto.put("content", msg.getContent());
        dto.put("sender", sender);
        dto.put("createdAt", msg.getCreatedAt().toString());
        return dto;
    }
}