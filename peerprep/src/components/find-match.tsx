"use client";

import { use, useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Button } from '@mantine/core';
import MatchTimerModal from '@/components/match-timer-modal';
import { UserContext } from '@/lib/contexts';
import { useRouter } from 'next/navigation';
import { UserWithToken } from '@/actions/user';

export default function FindMatch({ questionId, user }: {questionId: number, user: UserWithToken}) {
  const router = useRouter();
  
  const socket = useRef<WebSocket | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);

  // useEffect(() => {
  //   const user_id = user.id;  // Replace with actual user ID
  //   const socketUrl = `ws://localhost:8086/ws/${user_id}`;
  //   const ws = new WebSocket(socketUrl);

  //   // Store the WebSocket instance in state
  //   socket.current = ws;

  //   // Handle messages from the server
  //   ws.onmessage = (event) => {
  //     console.log('Received message:', event.data);
  //     setMessage(event.data);
  //   };

  //   // Handle WebSocket closure
  //   ws.onclose = () => {
  //     console.log('WebSocket connection closed');
  //   };

  //   return () => {
  //     // Clean up WebSocket when component is unmounted
  //     ws.close();
  //   };
  // }, []);

  const handleFindMatch = async () => {
    const user_id = 123;  // Replace with actual user ID
    const question_id = questionId;  // Replace with actual question ID

    setLoading(true);
    setIsMatching(true);
    setIsTimeout(false);

    const timer = setTimeout(() => {
      setIsMatching(false);
      setIsTimeout(true);
    }, 30000); // 30 seconds

    try {
      const response = await axios.post('http://localhost:8086/find_match/', {
        user_id,
        question_id,
      });

      console.log('Match response:', response.data);
      clearTimeout(timer); // Clear timeout if a match is found before 30 seconds
      setIsMatching(false); // Stop matching
    } catch (error) {
      console.error('Error finding match:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleCancel = () => {
    setIsMatching(false);
    setLoading(false);
  };

  return (
    <div>
      <Button onClick={handleFindMatch} loading={loading}>
        Match
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
