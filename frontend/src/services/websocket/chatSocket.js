class ChatWebSocket {
    constructor(roomId, onMessageReceived, token) {
        this.roomId = roomId;
        this.onMessageReceived = onMessageReceived;
        this.token = token;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isConnecting = false;
        this.pingInterval = null;
        this.messageCache = new Set(); // Add message cache to prevent duplicates
    }

    connect() {
        if (this.isConnecting) {
            console.log('🔄 Already attempting to connect...');
            return;
        }

        try {
            this.isConnecting = true;
            console.log(`🔄 Attempting to connect to WebSocket...`);
            console.log(`Room ID: ${this.roomId}`);
            
            // Close existing connection if any
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }

            this.ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${this.roomId}/?token=${this.token}`);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.setupPing();
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Create a unique message identifier
                    const messageId = `${data.user_id}-${data.message}-${Date.now()}`;
                    
                    // Check if we've already processed this message
                    if (!this.messageCache.has(messageId)) {
                        this.messageCache.add(messageId);
                        // Remove old messages from cache after 5 seconds
                        setTimeout(() => this.messageCache.delete(messageId), 5000);
                        
                        console.log('📨 Received message:', data);
                        this.onMessageReceived(data);
                    }
                } catch (error) {
                    console.error('❌ Error parsing message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('🔒 WebSocket closed:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                this.isConnecting = false;
                this.clearPing();
                this.handleReconnection();
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', {
                    error: error,
                    readyState: this.ws?.readyState,
                    url: this.ws?.url
                });
                this.isConnecting = false;
            };
        } catch (error) {
            console.error('❌ Error creating WebSocket:', error);
            this.isConnecting = false;
        }
    }

    setupPing() {
        // Clear any existing ping interval
        this.clearPing();
        
        // Setup new ping interval
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Send ping every 30 seconds
    }

    clearPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
            
            setTimeout(() => {
                if (!this.isConnecting) {
                    this.connect();
                }
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    sendMessage(messageData) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = {
                message: messageData.content,
                user_id: messageData.user_id,
                username: messageData.username
            };
            
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error sending message:', error);
                throw error;
            }
        } else {
            throw new Error('WebSocket is not connected');
        }
    }

    disconnect() {
        this.clearPing();
        if (this.ws) {
            console.log('🔌 Disconnecting WebSocket...');
            this.ws.close();
            this.ws = null;
        }
    }
}

export default ChatWebSocket;