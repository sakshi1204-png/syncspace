package com.syncspace.server.service;

import com.syncspace.server.model.*;
import com.syncspace.server.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMemberRepository memberRepository,
                            UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    public Workspace createWorkspace(String name, String description, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = new Workspace();
        workspace.setName(name);
        workspace.setDescription(description);
        workspace.setOwner(owner);
        workspace.setInviteCode(UUID.randomUUID().toString().substring(0, 8));

        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(saved);
        member.setUser(owner);
        member.setRole(WorkspaceMember.Role.OWNER);
        memberRepository.save(member);

        return saved;
    }

    public List<Workspace> getUserWorkspaces(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return workspaceRepository.findByOwner(user);
    }

    public Workspace getWorkspace(Long id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
    }

    public WorkspaceMember inviteMember(Long workspaceId, String email) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (memberRepository.existsByWorkspaceAndUser(workspace, user)) {
            throw new RuntimeException("User already a member");
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(user);
        member.setRole(WorkspaceMember.Role.MEMBER);

        return memberRepository.save(member);
    }
}