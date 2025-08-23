"""
WebSocket API endpoints.

This module provides WebSocket endpoints for real-time communication, including:
- Analysis progress updates
- Real-time notifications
- Live status updates
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import Dict, List
import json
import asyncio
from loguru import logger

from app.core.security import verify_token
from app.models.user import User

router = APIRouter()

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        # Map of user_id -> WebSocket connection
        self.active_connections: Dict[int, WebSocket] = {}
        # Map of analysis_id -> list of user_ids watching
        self.analysis_watchers: Dict[int, List[int]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected for user {user_id}")
    
    def disconnect(self, user_id: int):
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"WebSocket disconnected for user {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: int):
        """Send a message to a specific user."""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast_to_analysis_watchers(self, message: dict, analysis_id: int):
        """Send a message to all users watching a specific analysis."""
        if analysis_id in self.analysis_watchers:
            for user_id in self.analysis_watchers[analysis_id]:
                await self.send_personal_message(message, user_id)
    
    def add_analysis_watcher(self, analysis_id: int, user_id: int):
        """Add a user to the watchers list for an analysis."""
        if analysis_id not in self.analysis_watchers:
            self.analysis_watchers[analysis_id] = []
        if user_id not in self.analysis_watchers[analysis_id]:
            self.analysis_watchers[analysis_id].append(user_id)
    
    def remove_analysis_watcher(self, analysis_id: int, user_id: int):
        """Remove a user from the watchers list for an analysis."""
        if analysis_id in self.analysis_watchers and user_id in self.analysis_watchers[analysis_id]:
            self.analysis_watchers[analysis_id].remove(user_id)

manager = ConnectionManager()

@router.websocket("/analyses/{analysis_id}")
async def websocket_analysis_endpoint(
    websocket: WebSocket,
    analysis_id: int,
    token: str = None
):
    """
    WebSocket endpoint for real-time analysis updates.
    
    Provides live updates on analysis progress, findings, and status changes.
    """
    try:
        # Authenticate the WebSocket connection
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Verify JWT token
        try:
            payload = verify_token(token)
            user_id = payload.get("sub")
            if not user_id:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Connect the WebSocket
        await manager.connect(websocket, user_id)
        manager.add_analysis_watcher(analysis_id, user_id)
        
        # Send initial connection confirmation
        await manager.send_personal_message({
            "type": "connected",
            "analysis_id": analysis_id,
            "message": "Connected to analysis updates"
        }, user_id)
        
        # Keep connection alive and handle messages
        try:
            while True:
                # Wait for messages from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                await handle_websocket_message(message, user_id, analysis_id)
                
        except WebSocketDisconnect:
            manager.disconnect(user_id)
            manager.remove_analysis_watcher(analysis_id, user_id)
            
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        except:
            pass

@router.websocket("/notifications")
async def websocket_notifications_endpoint(
    websocket: WebSocket,
    token: str = None
):
    """
    WebSocket endpoint for real-time notifications.
    
    Provides live notifications for user events like:
    - Analysis completion
    - New findings
    - System updates
    """
    try:
        # Authenticate the WebSocket connection
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Verify JWT token
        try:
            payload = verify_token(token)
            user_id = payload.get("sub")
            if not user_id:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Connect the WebSocket
        await manager.connect(websocket, user_id)
        
        # Send initial connection confirmation
        await manager.send_personal_message({
            "type": "connected",
            "message": "Connected to notifications"
        }, user_id)
        
        # Keep connection alive
        try:
            while True:
                # Wait for messages from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle notification messages
                await handle_notification_message(message, user_id)
                
        except WebSocketDisconnect:
            manager.disconnect(user_id)
            
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        except:
            pass

async def handle_websocket_message(message: dict, user_id: int, analysis_id: int):
    """
    Handle incoming WebSocket messages for analysis updates.
    """
    message_type = message.get("type")
    
    if message_type == "ping":
        # Respond to ping with pong
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": message.get("timestamp")
        }, user_id)
    
    elif message_type == "subscribe":
        # Subscribe to analysis updates
        manager.add_analysis_watcher(analysis_id, user_id)
        await manager.send_personal_message({
            "type": "subscribed",
            "analysis_id": analysis_id,
            "message": "Subscribed to analysis updates"
        }, user_id)
    
    elif message_type == "unsubscribe":
        # Unsubscribe from analysis updates
        manager.remove_analysis_watcher(analysis_id, user_id)
        await manager.send_personal_message({
            "type": "unsubscribed",
            "analysis_id": analysis_id,
            "message": "Unsubscribed from analysis updates"
        }, user_id)
    
    else:
        # Unknown message type
        await manager.send_personal_message({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, user_id)

async def handle_notification_message(message: dict, user_id: int):
    """
    Handle incoming WebSocket messages for notifications.
    """
    message_type = message.get("type")
    
    if message_type == "ping":
        # Respond to ping with pong
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": message.get("timestamp")
        }, user_id)
    
    else:
        # Unknown message type
        await manager.send_personal_message({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, user_id)

# Utility functions for sending updates from other parts of the application
async def send_analysis_update(analysis_id: int, update_type: str, data: dict):
    """
    Send an analysis update to all watchers.
    
    This function can be called from other parts of the application
    to send real-time updates about analysis progress.
    """
    message = {
        "type": "analysis_update",
        "analysis_id": analysis_id,
        "update_type": update_type,
        "data": data,
        "timestamp": asyncio.get_event_loop().time()
    }
    
    await manager.broadcast_to_analysis_watchers(message, analysis_id)

async def send_notification(user_id: int, notification_type: str, data: dict):
    """
    Send a notification to a specific user.
    
    This function can be called from other parts of the application
    to send real-time notifications to users.
    """
    message = {
        "type": "notification",
        "notification_type": notification_type,
        "data": data,
        "timestamp": asyncio.get_event_loop().time()
    }
    
    await manager.send_personal_message(message, user_id)
