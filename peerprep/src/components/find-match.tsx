"use client";

import { use, useContext, useEffect, useRef, useState } from 'react';
import { Button, Notification } from '@mantine/core';
import MatchTimerModal from '@/components/match-timer-modal';
import { UserContext } from '@/lib/contexts';
import { useRouter } from 'next/navigation';
import { UserWithToken } from '@/actions/user';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { MatchSchema, Match } from '@/lib/schemas';
import { createSession } from '@/actions/collab'
import { getMatchWsUrl } from '@/actions/url';

export default function FindMatch({ questionId, user }: { questionId: number, user: UserWithToken }) {
  const router = useRouter();

  const socket = useRef<WebSocket | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      socket.current?.close();
    }
  }, [])

  const handleFindMatch = async () => {
    setIsLoading(true);
    const user_id = user.id;
    const question_id = questionId;
    const url = await getMatchWsUrl();

    const ws = new WebSocket(`${url}/ws/${user_id}`);

    // Store the WebSocket instance in state
    socket.current = ws;

    // Handle messages from the server
    ws.onopen = (event) => {
      setIsMatching(true);
      ws.send(JSON.stringify({
        user_id,
        question_id
      }));
    }

    ws.onerror = (event) => {
      setIsMatching(false);
      console.log(event);
      notifications.show({ message: "Error while connecting to the server, please try again", title: "Server Error", color: "red" });
      ws.close();
    }

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      try {
        const match = MatchSchema.parse(JSON.parse(event.data));
        console.log(match);
        notifications.show({ message: `Match found with ${match.user_2}`, title: "Match Success", color: "green" });
        (async () => {
          const session = await createSession(match);
          router.push(`/user/session/${session}`);
        })();
      } catch (e) {
        console.log(e);
        notifications.show({ message: "Match attempt timed out, please try again", title: "Match Timeout", color: "red" })
      }
      setIsMatching(false);
      ws.close();
    };

    ws.onclose = () => {
      setIsLoading(false);
      socket.current = null;
      setIsMatching(false);
      console.log('WebSocket connection closed');
    };
  }

  const handleCancel = () => {
    setIsMatching(false);
    socket.current?.close();
  };

  return (
    <>
      <Button onClick={handleFindMatch} loading={isLoading}>
        Match
      </Button>

      <MatchTimerModal
        onTimeout={() => {
          notifications.show({ message: "Match attempt timed out, please try again", title: "Match Timeout", color: "red" });
          socket.current?.close();
        }}
        opened={isMatching}
        onClose={handleCancel}
        onCancel={handleCancel}
      />
    </>
  );
}
