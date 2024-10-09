"use client"

import { logout, UserWithToken } from "@/actions/user";
import { Button, Center, Stack, Title } from "@mantine/core";
import Link from "next/link";

export default function Home({ user }: { user?: UserWithToken }) {
  return (
    <Center h="80vh" w="100%">
      <Stack justify="center">
        <Title order={1} mb="xl" ta="center">Welcome to PeerPrep</Title>
        <Link href="/questions">
          <Button w="100%">Question List</Button>
        </Link>
        {user ?
          <Button onClick={e => logout()}>
            Log Out
          </Button> :
          <>
            <Link href="/user/login">
              <Button w="100%">Log In</Button>
            </Link>
            <Link href="/user/signup">
              <Button w="100%">Sign Up</Button>
            </Link>
          </>
        }
      </Stack>
    </Center>
  );
}
