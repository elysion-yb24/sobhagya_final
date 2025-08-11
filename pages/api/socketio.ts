import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';
import { Server as IOServer, Socket } from 'socket.io';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NextApiResponse['socket'] & { server: { io?: IOServer } };
};

// In-memory storage for chat rooms and participants
const chatRooms: Record<string, {
  participants: Set<string>;
  messages: Array<{
    id: string;
    text: string;
    sender: string;
    senderRole: 'user' | 'partner';
    timestamp: number;
  }>;
  sessionStartTime?: number;
  sessionDuration?: number; // seconds
}> = {};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server as any, {
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });
    res.socket.server.io = io;

    io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // Join chat room
      socket.on('join_room', (data: { 
        roomId: string; 
        userId: string; 
        userName: string; 
        role: 'user' | 'partner' 
      }) => {
        const { roomId, userId, userName, role } = data;
        
        // Join the socket room
        socket.join(roomId);
        
        // Initialize room if it doesn't exist
        if (!chatRooms[roomId]) {
          chatRooms[roomId] = {
            participants: new Set(),
            messages: []
          };
        }
        
        // Add participant to room
        chatRooms[roomId].participants.add(userId);
        
        // Store user info in socket
        socket.data = { roomId, userId, userName, role };
        
        // Notify others in the room
        socket.to(roomId).emit('user_joined', {
          userId,
          userName,
          role,
          message: `${userName} joined the chat`
        });
        
        // Send existing messages to new participant
        socket.emit('room_history', chatRooms[roomId].messages);

        // If session has already started, inform the newly joined client
        if (chatRooms[roomId].sessionStartTime && chatRooms[roomId].sessionDuration) {
          socket.emit('session_started', {
            roomId,
            startTime: chatRooms[roomId].sessionStartTime,
            duration: chatRooms[roomId].sessionDuration
          });
        }
        
        console.log(`${userName} (${role}) joined room ${roomId}`);
      });

      // Send message
      socket.on('send_message', (data: { 
        roomId: string; 
        text: string; 
        userId: string; 
        userName: string; 
        role: 'user' | 'partner';
        messageId?: string;
      }) => {
        const { roomId, text, userId, userName, role, messageId } = data;
        
        if (!chatRooms[roomId]) {
          return;
        }
        
        const message = {
          id: messageId || `${Date.now()}-${Math.random()}`,
          text,
          sender: userName,
          senderRole: role,
          timestamp: Date.now(),
          status: 'sent'
        };
        
        // Store message in room history
        chatRooms[roomId].messages.push(message);
        
        // Broadcast to all participants in the room
        io.to(roomId).emit('new_message', message);
        
        // Simulate message delivery and read status
        setTimeout(() => {
          io.to(roomId).emit('message_status_update', {
            messageId: message.id,
            status: 'delivered'
          });
        }, 1000);
        
        setTimeout(() => {
          io.to(roomId).emit('message_status_update', {
            messageId: message.id,
            status: 'read'
          });
        }, 2000);
        
        console.log(`Message from ${userName} in room ${roomId}: ${text}`);
      });

      // Start session (shared timer)
      socket.on('start_session', (data: { roomId: string; duration?: number }) => {
        const { roomId, duration } = data;
        const now = Date.now();
        const sessionDuration = typeof duration === 'number' && duration > 0 ? duration : 300; // default 5 min

        if (!chatRooms[roomId]) {
          chatRooms[roomId] = {
            participants: new Set(),
            messages: [],
          };
        }

        // Only set start time if not already started
        if (!chatRooms[roomId].sessionStartTime) {
          chatRooms[roomId].sessionStartTime = now;
          chatRooms[roomId].sessionDuration = sessionDuration;

          // Broadcast session start to all in room using the active io instance
          io.to(roomId).emit('session_started', {
            roomId,
            startTime: now,
            duration: sessionDuration
          });
          console.log(`Session started in room ${roomId} for ${sessionDuration}s`);
        } else {
          // If already started, just send current state to requester
          socket.emit('session_started', {
            roomId,
            startTime: chatRooms[roomId].sessionStartTime,
            duration: chatRooms[roomId].sessionDuration
          });
        }
      });

      // Allow clients to request current session state explicitly
      socket.on('request_session_state', (data: { roomId: string }) => {
        const { roomId } = data;
        const room = chatRooms[roomId];
        if (room?.sessionStartTime && room?.sessionDuration) {
          socket.emit('session_started', {
            roomId,
            startTime: room.sessionStartTime,
            duration: room.sessionDuration
          });
        }
      });

      // Leave room
      socket.on('leave_room', (data: { roomId: string; userId: string; userName: string }) => {
        const { roomId, userId, userName } = data;
        
        socket.leave(roomId);
        
        if (chatRooms[roomId]) {
          chatRooms[roomId].participants.delete(userId);
          
          // Clean up empty rooms
          if (chatRooms[roomId].participants.size === 0) {
            delete chatRooms[roomId];
          }
        }
        
        // Notify others
        socket.to(roomId).emit('user_left', {
          userId,
          userName,
          message: `${userName} left the chat`
        });
        
        console.log(`${userName} left room ${roomId}`);
      });

      // Typing indicator
      socket.on('typing_start', (data: { roomId: string; userName: string; role: 'user' | 'partner' }) => {
        socket.to(data.roomId).emit('user_typing', {
          userName: data.userName,
          role: data.role
        });
      });

      socket.on('typing_stop', (data: { roomId: string; userName: string }) => {
        socket.to(data.roomId).emit('user_stopped_typing', {
          userName: data.userName
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const { roomId, userId, userName } = socket.data || {};
        
        if (roomId && userId && userName) {
          if (chatRooms[roomId]) {
            chatRooms[roomId].participants.delete(userId);
            
            if (chatRooms[roomId].participants.size === 0) {
              delete chatRooms[roomId];
            }
          }
          
          socket.to(roomId).emit('user_left', {
            userId,
            userName,
            message: `${userName} disconnected`
          });
        }
        
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  res.end('Socket.IO server ready');
}

export const config = {
  api: {
    bodyParser: false,
  },
};
