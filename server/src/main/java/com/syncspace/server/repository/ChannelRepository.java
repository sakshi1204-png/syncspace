package com.syncspace.server.repository;

import com.syncspace.server.model.Channel;
import com.syncspace.server.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findByWorkspace(Workspace workspace);
}