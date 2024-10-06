"use client"

import { Button, Center, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

interface FormData {
  username: string,
  password: string,
  confirmPassword: string,
}

export default function SignupForm() {
  const form = useForm<FormData>({
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
    }
  });

  return (
    <Stack align="stretch" w={600}>
      <Title order={1} ta="center">Welcome to PeerPrep</Title>
      <TextInput mt="xl" placeholder="Username" {...form.getInputProps("username")} />
      <PasswordInput placeholder="Password" {...form.getInputProps("password")} />
      <PasswordInput placeholder="Confirm Password" {...form.getInputProps("confirmPassword")} />
      <Center mt="lg">
        <Button type="submit">Sign Up</Button>
      </Center>
    </Stack>
  )

}
