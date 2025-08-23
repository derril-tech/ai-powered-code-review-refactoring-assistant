'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '@/lib/types';

interface WebSocketContextType {
  isConnected: boolean;
  connect: (analysisId: number) => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  lastMessage: WebSocketMessage | null;
  connectionError: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = (analysisId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setConnectionError('No authentication token available');
      return;
    }

    const wsUrl = `${WS_BASE_URL}/ws/analyses/${analysisId}?token=${token}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'status':
              console.log('Analysis status:', message.status);
              break;
            case 'progress':
              console.log('Analysis progress:', message.progress);
              break;
            case 'finding':
              console.log('New finding:', message.finding);
              break;
            case 'done':
              console.log('Analysis completed:', message.summary);
              break;
            case 'error':
              console.error('Analysis error:', message.error);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect(analysisId);
          }, delay);
        }
      };

      ws.onerror = (error) => {
        setConnectionError('WebSocket connection error');
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      setConnectionError('Failed to create WebSocket connection');
      console.error('WebSocket connection failed:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setLastMessage(null);
    setConnectionError(null);
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    lastMessage,
    connectionError,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
