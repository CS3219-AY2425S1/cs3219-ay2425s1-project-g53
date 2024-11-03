"use client"

import { Text, AppShellHeader, Box, Burger, Group } from "@mantine/core";
import { MouseEventHandler, use } from "react";
import Logo from "./logo";
import { IconLogin, IconUser, IconUserCircle } from "@tabler/icons-react";
import { UserWithToken } from "@/actions/user";
import { UserContext } from "@/lib/contexts";
import { useSessions } from "@/lib/hooks/user";
import SessionBadge from "./session-badge";

export default function Header({ opened, onClick }: { opened?: boolean, onClick?: MouseEventHandler<HTMLButtonElement> }) {
  const user = use(UserContext);
  const sessions = user ? useSessions(user) : undefined;

  return (
    <AppShellHeader>
      <Group h="100%" justify="space-between">
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={onClick} />
          <Logo />
        </Group>
        <Group h="100%" px="md" justify="flex-end">
          {sessions && sessions.data && sessions.data.length > 0 && <SessionBadge sessions={sessions.data} />}
          {user && <Text size="lg">{user.username}</Text>}
          <Box h="xl" w="xl">
            <IconUserCircle height="100%" width="100%" />
          </Box>
        </Group>
      </Group>
    </AppShellHeader>)
}
