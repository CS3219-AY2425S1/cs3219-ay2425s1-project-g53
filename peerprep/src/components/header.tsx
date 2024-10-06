import { AppShellHeader, Box, Burger, Group } from "@mantine/core";
import { MouseEventHandler } from "react";
import Logo from "./logo";
import { IconLogin, IconUser, IconUserCircle } from "@tabler/icons-react";

export default function Header({ opened, onClick }: { opened?: boolean, onClick?: MouseEventHandler<HTMLButtonElement> }) {
  return (
    <AppShellHeader>
      <Group h="100%" justify="space-between">
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={onClick} />
          <Logo />
        </Group>
        <Group h="100%" px="md" justify="flex-end">
          <Box h="xl" w="xl">
            <IconUserCircle height="100%" width="100%" />
          </Box>
        </Group>
      </Group>
    </AppShellHeader>)
}
