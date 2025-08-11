"use client";

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function WebSocketTest() {
  const [status, setStatus] = useState('Connecting...');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io({
      path: '/api/socketio',
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      setStatus('Connected successfully!');
      setConnected(true);
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
      setStatus(`Connection error: ${error.message}`);
      setConnected(false);
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      setStatus(`Disconnected: ${reason}`);
      setConnected(false);
      console.log('Socket disconnected:', reason);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">WebSocket Connection Test</h1>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">Status: {status}</span>
          </div>
          <p className="text-sm text-gray-600">
            If you see "Connected successfully!" above, your WebSocket connection is working properly.
          </p>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">Troubleshooting:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Make sure the dev server is running</li>
              <li>• Check browser console for errors</li>
              <li>• Try refreshing the page</li>
              <li>• Check if port 3000 is available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
