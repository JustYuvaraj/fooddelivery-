package com.fooddelivery.repository;

import com.fooddelivery.model.entity.DeliveryAssignment;
import com.fooddelivery.model.enums.AssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    
    List<DeliveryAssignment> findByOrderId(Long orderId);
    
    List<DeliveryAssignment> findByOrderIdAndStatus(Long orderId, AssignmentStatus status);
    
    Optional<DeliveryAssignment> findByOrderIdAndDeliveryAgentIdAndStatus(
        Long orderId, Long agentId, AssignmentStatus status);
    
    Optional<DeliveryAssignment> findByOrderIdAndDeliveryAgentId(Long orderId, Long agentId);
    
    List<DeliveryAssignment> findByDeliveryAgentIdAndStatus(Long agentId, AssignmentStatus status);
    
    List<DeliveryAssignment> findByDeliveryAgentIdAndStatusIn(Long agentId, List<AssignmentStatus> statuses);
    
    Page<DeliveryAssignment> findByDeliveryAgentIdAndStatusInOrderByAssignedAtDesc(
        Long agentId, List<AssignmentStatus> statuses, Pageable pageable);
    
    @Query("SELECT COUNT(da) FROM DeliveryAssignment da WHERE da.deliveryAgent.id = :agentId " +
           "AND da.status IN :statuses")
    Integer countByAgentIdAndStatusIn(@Param("agentId") Long agentId, 
                                       @Param("statuses") List<AssignmentStatus> statuses);
}
