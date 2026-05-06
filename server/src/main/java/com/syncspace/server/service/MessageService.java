package com.syncspace.server.service;

import com.syncspace.server.model.Channel;
import com.syncspace.server.model.Message;
import com.syncspace.server.model.User;
import com.syncspace.server.repository.ChannelRepository;
import com.syncspace.server.repository.MessageRepository;
import com.syncspace.server.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository,
                          ChannelRepository channelRepository,
                          UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
    }

    public Message saveMessage(String content, Long channelId, Long senderId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = new Message();
        message.setContent(content);
        message.setChannel(channel);
        message.setSender(sender);

        return messageRepository.save(message);
    }

    public List<Message> getChannelMessages(Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));
        return messageRepository.findTop50ByChannelOrderByCreatedAtAsc(channel);
    }
}