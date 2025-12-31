import { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";

// यहां अपने backend का URL डालो
const SOCKET_URL = "http://localhost:7001"; 

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export const initSocket = (userId: any, usertype: any, threadId: any) => {
  socket = io(SOCKET_URL, {
    query: { userId, usertype, threadId },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => socket;
