package com.syncspace.server.controller;

import com.syncspace.server.model.Channel;
import com.syncspace.server.service.ChannelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    private final ChannelService channelService;

    public ChannelController(ChannelService channelService) {
        this.channelService = channelService;
    }

    @PostMapping
    public ResponseEntity<Channel> createChannel(
            @RequestBody Map<String, Object> body,
            Principal principal) {
        Channel channel = channelService.createChannel(
                (String) body.get("name"),
                (String) body.get("description"),
                Long.valueOf(body.get("workspaceId").toString()),
                principal.getName());
        return ResponseEntity.ok(channel);
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<Channel>> getChannels(
            @PathVariable("workspaceId") Long workspaceId) {
        return ResponseEntity.ok(
            channelService.getWorkspaceChannels(workspaceId));
    }
}