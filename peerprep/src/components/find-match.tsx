"use client";

import { use, useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Button, Notification } from '@mantine/core';
import MatchTimerModal from '@/components/match-timer-modal';
import { UserContext } from '@/lib/contexts';
import { useRouter } from 'next/navigation';
import { UserWithToken } from '@/actions/user';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';

const MatchSchema = z.object({
  user_1: z.string(),
  user_2: z.string(),
  question_id: z.number(),
  match_time: z.string()
})
type Match = z.infer<typeof MatchSchema>;

export default function FindMatch({ questionId, user }: { questionId: number, user: UserWithToken }) {
  const router = useRouter();

  const socket = useRef<WebSocket | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);

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
    const user_id = user.id;  // Replace with actual user ID
    const question_id = questionId;  // Replace with actual question ID
    const socketUrl = `ws://localhost:8086/ws/${user_id}`;
    const ws = new WebSocket(socketUrl);

    // Store the WebSocket instance in state
    socket.current = ws;

    // Handle messages from the server
    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      try {
        const match = MatchSchema.parse(JSON.parse(event.data));
        console.log(match);
        notifications.show({ message: `Match found with ${match.user_2}`, title: "Match Success", color: "green" });
      } catch (e) {
        console.log(e);
      notifications.show({ message: "Match attempt timed out, please try again", title: "Match Timeout", color: "red" })
      }
      setIsMatching(false);
      ws.close();
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // notifications.show({ message: "There was an error while attempting to match, please try again", title: "Server Error", color: "red" })
    };

    setIsMatching(true);

    try {
      const response = await axios.post('http://localhost:8086/find_match/', {
        user_id,
        question_id,
      });

      console.log('Match response:', response.data);
      // ws.close();
      // setIsMatching(false); // Stop matching
    } catch (error) {
      console.error('Error finding match:', error);
    } finally {
      // setLoading(false); // Reset loading state
    }
  };

  const handleCancel = () => {
    setIsMatching(false);
    socket.current?.close();
  };

  return (
    <div>
      <Button onClick={handleFindMatch}>
        Match
      </Button>

      <MatchTimerModal
        opened={isMatching}
        onClose={handleCancel}
        onCancel={handleCancel}
      />
    </div>
  );
}
