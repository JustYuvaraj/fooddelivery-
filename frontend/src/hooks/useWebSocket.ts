import { useEffect, useCallback, useRef } from 'react';
import webSocketService from '@/services/websocket.service';

export const useWebSocket = (destination: string, callback: (data: any) => void) => {
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Connect if not already connected (handle errors gracefully)
    if (!webSocketService.isConnected()) {
      webSocketService.connect().catch((error) => {
        // Silently fail - WebSocket is optional, backend might not be running
        console.warn('WebSocket connection failed (backend may not be running):', error.message);
      });
    }

    // Subscribe to destination only if connected
    let unsubscribe: (() => void) | null = null;
    
    // Try to subscribe after a small delay to allow connection
    const subscribeTimeout = setTimeout(() => {
      if (webSocketService.isConnected()) {
        unsubscribe = webSocketService.subscribe(destination, (data) => {
          callbackRef.current(data);
        });
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(subscribeTimeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [destination]);

  const sendMessage = useCallback((body: any) => {
    webSocketService.send(destination, body);
  }, [destination]);

  return { sendMessage, isConnected: webSocketService.isConnected() };
};


