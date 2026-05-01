package com.gisagentproj.backend.repository;

import com.gisagentproj.backend.entity.AgentTask;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentTaskRepository extends JpaRepository<AgentTask, UUID> {

    List<AgentTask> findByStatusOrderByCreatedAtDesc(String status);

    List<AgentTask> findAllByOrderByCreatedAtDesc();

    List<AgentTask> findTop20ByOrderByCreatedAtDesc();
}
