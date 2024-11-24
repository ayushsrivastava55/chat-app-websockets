# Real-Time WebSocket Chat Application

A real-time chat application built with React and WebSocket, allowing users to communicate in different chat rooms.

## Features

- Real-time messaging using WebSocket
- Multiple chat rooms support
- Username-based identification
- Clean and responsive UI
- Environment-specific configurations

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- WebSocket client

### Backend
- Node.js with TypeScript
- WebSocket server (ws library)
- Environment variable support

## Project Structure

```
.
├── frontend/          # React frontend application
│   ├── src/          # Source files
│   ├── public/       # Static files
│   └── ...
└── backend/          # Node.js backend server
    ├── src/          # Source files
    └── ...
```

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/ayushsrivastava55/chat-app-websockets.git
cd chat-app-websockets
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Environment Variables

### Frontend
- `VITE_WS_URL`: WebSocket server URL (defaults to ws://localhost:8080 in development)

### Backend
- `PORT`: Server port (defaults to 8080)

## License

MIT
