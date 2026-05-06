package com.syncspace.server.repository;

import com.syncspace.server.model.Message;
import com.syncspace.server.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findTop50ByChannelOrderByCreatedAtAsc(Channel channel);
}