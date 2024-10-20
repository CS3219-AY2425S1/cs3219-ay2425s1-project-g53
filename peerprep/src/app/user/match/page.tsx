import { useEffect, useState } from 'react';

export default async function Page() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const user_id = 123;  // Replace with actual user ID
    const socketUrl = `ws://localhost:8086/ws/${user_id}`;
    const ws = new WebSocket(socketUrl);

    // Store the WebSocket instance in state
    setSocket(ws);

    // Handle messages from the server
    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      setMessage(event.data);
    };

    // Handle WebSocket closure
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      // Clean up WebSocket when component is unmounted
      ws.close();
    };
  }, []);

  return (
      <div>
        <h1>Match Page</h1>
        <p>{message}</p>
      </div>
  );
}
