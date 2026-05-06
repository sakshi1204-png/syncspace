package com.syncspace.server.repository;

import com.syncspace.server.model.Workspace;
import com.syncspace.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOwner(User owner);
    Optional<Workspace> findByInviteCode(String inviteCode);
}