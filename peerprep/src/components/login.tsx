"use client"

import { Button, Center, PasswordInput, Stack, TextInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";

interface FormData {
  username: string,
  password: string,
}

export default function LoginForm() {
  const form = useForm<FormData>({
    initialValues: {
      username: "",
      password: "",
    },

    validate: {
      username: s => s.trim().length !== 0 ? null : "No username input",
      password: s => s.trim().length !== 0 ? null : "No password input",
    }
  });

  return (
    <form onSubmit={form.onSubmit(v => console.log(v))}>
      <Stack w={600}>
        <TextInput label="Username" mt="xl" {...form.getInputProps("username")} />
        <PasswordInput label="Password" {...form.getInputProps("password")} />
        <Text size="sm">Don't have an account? <Link href="/signup">Sign Up</Link> instead</Text>
        <Center mt="lg">
          <Button type="submit">Log In</Button>
        </Center>
      </Stack>
    </form>
  )

}
