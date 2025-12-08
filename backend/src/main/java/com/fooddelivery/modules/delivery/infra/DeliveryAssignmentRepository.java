package com.fooddelivery.modules.delivery.infra;

import com.fooddelivery.model.entity.DeliveryAssignment;
import com.fooddelivery.model.enums.AssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    
    Page<DeliveryAssignment> findByDeliveryAgentIdOrderByAssignedAtDesc(Long agentId, Pageable pageable);
    
    List<DeliveryAssignment> findByOrderIdAndStatus(Long orderId, AssignmentStatus status);
    
    List<DeliveryAssignment> findByDeliveryAgentIdAndStatus(Long agentId, AssignmentStatus status);
}
