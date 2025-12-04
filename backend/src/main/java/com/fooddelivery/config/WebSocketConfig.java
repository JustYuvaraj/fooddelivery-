package com.fooddelivery.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration for real-time order tracking and notifications
 * 
 * Enables STOMP (Simple Text Oriented Messaging Protocol) over WebSocket
 * for bidirectional real-time communication
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure STOMP endpoints
     * - /api/v1/ws: WebSocket connection endpoint
     * - withSockJS(): Fallback for browsers without WebSocket support
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/v1/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }

    /**
     * Configure message broker for pub/sub messaging
     * - enableSimpleBroker: In-memory message broker (dev/testing)
     *   For production, use external broker (RabbitMQ, ActiveMQ)
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker for /topic (one-way) and /queue (one-to-one)
        config.enableSimpleBroker("/topic", "/queue");
        
        // Configure application destination prefix for controller methods
        config.setApplicationDestinationPrefixes("/app");
        
        // Configure user destination prefix for targeted messaging
        config.setUserDestinationPrefix("/user");
    }
}
