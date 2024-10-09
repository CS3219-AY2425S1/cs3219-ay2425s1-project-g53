import { Text, AppShellHeader, Box, Burger, Group } from "@mantine/core";
import { MouseEventHandler } from "react";
import Logo from "./logo";
import { IconLogin, IconUser, IconUserCircle } from "@tabler/icons-react";
import { UserWithToken } from "@/actions/user";

export default function Header({ opened, onClick, user }: { opened?: boolean, onClick?: MouseEventHandler<HTMLButtonElement>, user?: UserWithToken }) {
  return (
    <AppShellHeader>
      <Group h="100%" justify="space-between">
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={onClick} />
          <Logo />
        </Group>
        <Group h="100%" px="md" justify="flex-end">
          {user && <Text>{user.username}</Text>}
          <Box h="xl" w="xl">
            <IconUserCircle height="100%" width="100%" />
          </Box>
        </Group>
      </Group>
    </AppShellHeader>)
}
