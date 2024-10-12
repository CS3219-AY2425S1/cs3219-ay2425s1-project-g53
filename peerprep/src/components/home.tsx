"use client"

import { logout } from "@/actions/user";
import { UserContext } from "@/lib/contexts";
import { Button, Center, Stack, Title } from "@mantine/core";
import Link from "next/link";
import { use } from "react";

export default function Home() {
  const user = use(UserContext);

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
            <Link href="/auth/login">
              <Button w="100%">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button w="100%">Sign Up</Button>
            </Link>
          </>
        }
      </Stack>
    </Center>
  );
}
