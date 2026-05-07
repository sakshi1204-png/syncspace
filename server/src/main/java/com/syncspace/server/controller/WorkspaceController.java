package com.syncspace.server.controller;

import com.syncspace.server.model.Workspace;
import com.syncspace.server.model.WorkspaceMember;
import com.syncspace.server.repository.WorkspaceMemberRepository;
import com.syncspace.server.service.WorkspaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final WorkspaceMemberRepository memberRepository;

    public WorkspaceController(WorkspaceService workspaceService,
                               WorkspaceMemberRepository memberRepository) {
        this.workspaceService = workspaceService;
        this.memberRepository = memberRepository;
    }

    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(
            @RequestBody Map<String, String> body,
            Principal principal) {
        Workspace workspace = workspaceService.createWorkspace(
                body.get("name"),
                body.get("description"),
                principal.getName());
        return ResponseEntity.ok(workspace);
    }

    @GetMapping
    public ResponseEntity<List<Workspace>> getMyWorkspaces(
            Principal principal) {
        return ResponseEntity.ok(
            workspaceService.getUserWorkspaces(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workspace> getWorkspace(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(workspaceService.getWorkspace(id));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<WorkspaceMember>> getMembers(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(memberRepository.findByWorkspace(
            workspaceService.getWorkspace(id)));
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<WorkspaceMember> inviteMember(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            workspaceService.inviteMember(id, body.get("email")));
    }
}