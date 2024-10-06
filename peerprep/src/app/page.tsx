import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <Center h="80vh" w="100%">
      <Stack justify="center">
        <Title order={1} mb="xl" ta="center">Welcome to PeerPrep</Title>
        <Link href="/questions">
          <Button w="100%">Question List</Button>
        </Link>
        <Link href="/login">
          <Button w="100%">Log In</Button>
        </Link>
        <Link href="/signup">
          <Button w="100%">Sign Up</Button>
        </Link>
      </Stack>
    </Center>
  );
}
