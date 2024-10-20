"use client";

import { useEffect, useState } from 'react';
import axios from "axios";
import { Button } from '@mantine/core';
import MatchTimerModal from '@/components/MatchTimer'; // Adjust the path as needed

interface FindMatchProps {
  questionId: number; // Accept questionId as a prop
}

export default function FindMatch({ questionId }: FindMatchProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleFindMatch = async () => {
    const user_id = 123;  // Replace with actual user ID
    const question_id = questionId;  // Replace with actual question ID

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8086/find_match/', {
        user_id,
        question_id,
      });

      console.log('Match response:', response.data);
    } catch (error) {
      console.error('Error finding match:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div>
      <h1>Match Page</h1>
      <p>{message}</p>
      <Button onClick={handleFindMatch} loading={loading}>
        Find Match
      </Button>

      <MatchTimerModal 
        opened={isMatching} 
        onClose={handleCancel} 
        timeout={isTimeout} 
        onCancel={handleCancel} 
      />
    </div>
  );
}