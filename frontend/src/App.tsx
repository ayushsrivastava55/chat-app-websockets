import { useEffect, useRef, useState } from 'react'
import './App.css'


const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

interface ChatMessage {
  type: 'chat' | 'join';
  payload: {
    roomId: string;
    message?: string;
    username?: string;
  };
}

const App = () => {
  const [messages, setMessages] = useState<Array<{ username: string; message: string }>>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPrompted = useRef(false);

  useEffect(() => {
    const initializeChat = async () => {
      if (!hasPrompted.current) {
        hasPrompted.current = true;
        const name = prompt('Please enter your username:');
        if (name) {
          setUsername(name);
          const room = prompt('Please enter room ID:');
          if (room) {
            setRoomId(room);
          }
        }
      }
    };

    initializeChat();

    const handleTabClose = () => {
      hasPrompted.current = false;
    };

    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  useEffect(() => {
    if (!username || !roomId) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setWsConnected(true);
      const joinMessage: ChatMessage = {
        type: 'join',
        payload: {
          roomId: roomId,
          username: username
        }
      };
      console.log('Sending join message:', joinMessage);
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setWsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId, username]);

  const sendMessage = () => {
    const message = inputRef.current?.value;
    if (message && wsRef.current && roomId && username && wsConnected) {
      const chatMessage: ChatMessage = {
        type: 'chat',
        payload: {
          roomId: roomId,
          message: message,
          username: username
        }
      };
      console.log('Sending chat message:', chatMessage);
      wsRef.current.send(JSON.stringify(chatMessage));
      inputRef.current.value = '';
    } else {
      console.log('Cannot send message:', { 
        hasMessage: !!message, 
        hasWebSocket: !!wsRef.current, 
        hasRoomId: !!roomId,
        hasUsername: !!username,
        isConnected: wsConnected
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleLogout = () => {
    setUsername('');
    setRoomId('');
    setMessages([]);
    hasPrompted.current = false;
    if (wsRef.current) {
      wsRef.current.close();
    }
    window.location.reload();
  };

  return (
    <div className='h-screen bg-gray-900 text-white'>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold mb-2">Chat Room</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
          {roomId && username && (
            <div className="text-gray-400">
              <p>Room ID: {roomId}</p>
              <p>Username: {username}</p>
              <p className={wsConnected ? "text-green-400" : "text-red-400"}>
                {wsConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          )}
        </div>
        
        <div className="h-[70vh] bg-gray-800 rounded-lg p-4 mb-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-700 rounded">
              <span className="font-bold text-blue-400">{message.username}</span>: {message.message}
            </div>
          ))}
        </div>

        <div className='flex gap-2'>
          <input
            ref={inputRef}
            type="text"
            className='flex-1 p-4 rounded-lg bg-gray-800 text-white'
            placeholder='Type your message...'
            onKeyPress={handleKeyPress}
            disabled={!wsConnected}
          />
          <button
            onClick={sendMessage}
            className={`px-6 py-2 rounded-lg transition-colors ${
              wsConnected 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
            disabled={!wsConnected}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App
