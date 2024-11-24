import { WebSocketServer, WebSocket } from "ws";

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ 
  port: Number(PORT)
});

console.log(`WebSocket server started on port ${PORT}`);

interface User {
  socket: WebSocket;
  room: string;
  username: string;
}

interface Message {
  type: 'join' | 'chat';
  payload: {
    roomId: string;
    message?: string;
    username: string;
  };
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  console.log("New client connected");

  socket.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString()) as Message;
      console.log("Received message:", message);

      if (message.type === 'join') {
        console.log("User joining room:", message.payload.roomId);
        
        // Remove existing socket if it exists
        allSockets = allSockets.filter(s => s.socket !== socket);
        
        // Add new socket
        allSockets.push({
          socket,
          room: message.payload.roomId,
          username: message.payload.username
        });
        
        console.log("Current users in rooms:", allSockets.map(s => ({ room: s.room, username: s.username })));
      }
      
      if (message.type === 'chat') {
        const currentUser = allSockets.find((x) => x.socket === socket);
        console.log("Sending message in room:", currentUser?.room);
        
        if (!currentUser) {
          console.log("User not in any room");
          return;
        }

        if (!message.payload.message) {
          console.log("No message to send");
          return;
        }

        const roomUsers = allSockets.filter(s => s.room === currentUser.room);
        console.log("Number of users in room:", roomUsers.length);

        const messageToSend = {
          username: message.payload.username,
          message: message.payload.message
        };

        for (const user of roomUsers) {
          if (user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify(messageToSend));
            console.log("Message sent to user in room:", currentUser.room);
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  socket.on('close', () => {
    console.log("Client disconnected");
    const disconnectedUser = allSockets.find(s => s.socket === socket);
    if (disconnectedUser) {
      console.log(`User ${disconnectedUser.username} disconnected from room ${disconnectedUser.room}`);
    }
    allSockets = allSockets.filter(s => s.socket !== socket);
  });

  socket.on('error', (error) => {
    console.error("WebSocket error:", error);
  });
});