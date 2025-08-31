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
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  subscribeToAnalysis: (analysisId: number, callback: (message: WebSocketMessage) => void) => () => void;
  subscribeToNotifications: (callback: (message: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const subscriptionsRef = useRef<Map<string, Set<(message: WebSocketMessage) => void>>>(new Map());
  const currentAnalysisIdRef = useRef<number | null>(null);

  const notifySubscribers = (message: WebSocketMessage) => {
    // Notify analysis-specific subscribers
    if (currentAnalysisIdRef.current) {
      const analysisKey = `analysis_${currentAnalysisIdRef.current}`;
      const analysisSubscribers = subscriptionsRef.current.get(analysisKey);
      if (analysisSubscribers) {
        analysisSubscribers.forEach(callback => callback(message));
      }
    }

    // Notify general notification subscribers
    const notificationSubscribers = subscriptionsRef.current.get('notifications');
    if (notificationSubscribers) {
      notificationSubscribers.forEach(callback => callback(message));
    }
  };

  const connect = (analysisId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentAnalysisIdRef.current === analysisId) {
      return; // Already connected to this analysis
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    currentAnalysisIdRef.current = analysisId;
    setConnectionStatus('connecting');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setConnectionError('No authentication token available');
      setConnectionStatus('error');
      return;
    }

    const wsUrl = `${WS_BASE_URL}/ws/analyses/${analysisId}?token=${token}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected to analysis:', analysisId);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Notify subscribers
          notifySubscribers(message);
          
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
            case 'proposal_created':
              console.log('New proposal created:', message.proposal);
              break;
            case 'proposal_applied':
              console.log('Proposal applied:', message.result);
              break;
            case 'done':
              console.log('Analysis completed:', message.summary);
              break;
            case 'error':
              console.error('Analysis error:', message.error);
              setConnectionError(message.error);
              break;
            case 'notification':
              console.log('Notification:', message.notification);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus(event.code === 1000 ? 'disconnected' : 'error');
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if not a normal closure and still on same analysis
        if (event.code !== 1000 && 
            reconnectAttemptsRef.current < maxReconnectAttempts && 
            currentAnalysisIdRef.current === analysisId) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          setConnectionStatus('connecting');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect(analysisId);
          }, delay);
        }
      };

      ws.onerror = (error) => {
        setConnectionError('WebSocket connection error');
        setConnectionStatus('error');
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      setConnectionError('Failed to create WebSocket connection');
      setConnectionStatus('error');
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
    
    currentAnalysisIdRef.current = null;
    setIsConnected(false);
    setConnectionStatus('disconnected');
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

  const subscribeToAnalysis = (analysisId: number, callback: (message: WebSocketMessage) => void) => {
    const key = `analysis_${analysisId}`;
    if (!subscriptionsRef.current.has(key)) {
      subscriptionsRef.current.set(key, new Set());
    }
    subscriptionsRef.current.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = subscriptionsRef.current.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscriptionsRef.current.delete(key);
        }
      }
    };
  };

  const subscribeToNotifications = (callback: (message: WebSocketMessage) => void) => {
    const key = 'notifications';
    if (!subscriptionsRef.current.has(key)) {
      subscriptionsRef.current.set(key, new Set());
    }
    subscriptionsRef.current.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = subscriptionsRef.current.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscriptionsRef.current.delete(key);
        }
      }
    };
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
    connectionStatus,
    subscribeToAnalysis,
    subscribeToNotifications,
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
