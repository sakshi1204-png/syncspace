package com.syncspace.server.service;

import com.syncspace.server.model.Channel;
import com.syncspace.server.model.User;
import com.syncspace.server.model.Workspace;
import com.syncspace.server.repository.ChannelRepository;
import com.syncspace.server.repository.UserRepository;
import com.syncspace.server.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public ChannelService(ChannelRepository channelRepository,
                          WorkspaceRepository workspaceRepository,
                          UserRepository userRepository) {
        this.channelRepository = channelRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
    }

    public Channel createChannel(String name, String description,
                                  Long workspaceId, String userEmail) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Channel channel = new Channel();
        channel.setName(name);
        channel.setDescription(description);
        channel.setWorkspace(workspace);
        channel.setCreatedBy(user);
        channel.setType(Channel.ChannelType.PUBLIC);

        return channelRepository.save(channel);
    }

    public List<Channel> getWorkspaceChannels(Long workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        return channelRepository.findByWorkspace(workspace);
    }
}