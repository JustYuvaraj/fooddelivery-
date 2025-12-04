package com.fooddelivery.repository;

import com.fooddelivery.model.entity.AgentLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentLocationRepository extends JpaRepository<AgentLocation, Long> {
    
    @Query("SELECT a FROM AgentLocation a WHERE a.agentId = :agentId " +
           "ORDER BY a.recordedAt DESC LIMIT 1")
    Optional<AgentLocation> findLatestByAgentId(@Param("agentId") Long agentId);
    
    List<AgentLocation> findByAgentIdOrderByRecordedAtDesc(Long agentId);
}
