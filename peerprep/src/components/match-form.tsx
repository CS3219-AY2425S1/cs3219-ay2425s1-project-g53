"use client"

import { Category, Complexity, Question } from "@/actions/questions";
import { getMatchWsUrl } from "@/actions/url";
import { UserWithToken } from "@/actions/user";
import { useForm } from "@mantine/form";
import { useRef, useState } from "react";
import MatchTimerModal from "./match-timer-modal";
import { notifications } from "@mantine/notifications";
import { createSession } from "@/actions/collab";
import { useRouter } from "next/navigation";
import { MatchSchema } from "@/lib/schemas";
import { Box, BoxProps, Button, Group, MultiSelect, Stack } from "@mantine/core";


function checkValid(questions: Question[], selectedComplexities: Set<Complexity>, selectedCategories: Set<String>) {
  for (const q of questions) {
    if (q.categories.map(c => c.name).find(c => selectedCategories.has(c)) && selectedComplexities.has(q.complexity)) {
      return true;
    }
  }
  return false;
}

interface FormData {
  selectedCategories: string[],
  selectedComplexities: Complexity[]
}

interface Transformed {
  user_id: string,
  categories: string[],
  complexities: string[]
}

export function MatchForm({ questions, user, ...boxProps}: { questions: Question[], user: UserWithToken } & BoxProps) {
  const [loading, setLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const socket = useRef<WebSocket | null>(null)
  const form = useForm<FormData, (values: FormData) => Transformed>({
    mode: "uncontrolled",
    initialValues: {
      selectedCategories: [],
      selectedComplexities: []
    },

    transformValues(values) {
      return { user_id: user.id, categories: values.selectedCategories, complexities: values.selectedComplexities }
    },

    validate: {
      selectedCategories(value, values) {
        return checkValid(questions, new Set(values.selectedComplexities.length == 0 ? complexityOptions : values.selectedComplexities), new Set(value.length == 0 ? categoryOptions : value)) ? null : "No question available";
      },
    },
  });
  const handleCancel = () => {
    setIsMatching(false);
    socket.current?.close();
  };

  const handleSubmit = async (v: Transformed) => {
    setLoading(true);
    const user_id = user.id;
    const url = await getMatchWsUrl();

    const ws = new WebSocket(`${url}/ws/${user_id}`);

    // Store the WebSocket instance in state
    socket.current = ws;

    // Handle messages from the server
    ws.onopen = (event) => {
      setIsMatching(true);
      ws.send(JSON.stringify(v));
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

  const categoryOptions = new Set(questions.flatMap(q => q.categories.map(c => c.name)));
  const complexityOptions: Complexity[] = ["Easy", "Medium", "Hard"]

  return (
    <>
      <Box {...boxProps}>
      <form style={{width: "100%"}} onSubmit={form.onSubmit(handleSubmit)}>
        <Stack w="100%">
          <MultiSelect searchable label="Select Categories" placeholder="Leave blank for all" data={[...categoryOptions]} {...form.getInputProps("selectedCategories")} />
          <MultiSelect label="Select Complexities" placeholder="Leave blank for all" data={complexityOptions} {...form.getInputProps("selectedComplexities")} />
          <Group justify="center">
            <Button  mt="md" type="submit">Match</Button>
          </Group>
        </Stack>
      </form>
    </Box>
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
  )
}
