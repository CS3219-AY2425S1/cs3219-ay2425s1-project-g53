"use client"

import { useLogin } from "@/lib/hooks/user";
import { Button, Center, PasswordInput, Stack, TextInput, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import React from "react";

interface FormData {
  email: string,
  password: string,
}

export default function LoginForm() {
  const { login, loginError } = useLogin();
  const form = useForm<FormData>({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: s => s.trim().length !== 0 ? null : "No email input",
      password: s => s.trim().length !== 0 ? null : "No password input",
    }
  });

  return (
    <React.Fragment>
      <form onSubmit={form.onSubmit(v => login(v.email, v.password))}>
        <Stack w={600}>
          <TextInput label="Email" mt="xl" {...form.getInputProps("email")} />
          <PasswordInput label="Password" {...form.getInputProps("password")} />
          <Text size="sm">Don't have an account? <Link href="/user/signup">Sign Up</Link> instead</Text>
          <Center mt="lg">
            <Button type="submit">Log In</Button>
          </Center>
        </Stack>
      </form>
      {loginError &&
        <Alert title="Login Error" color="red">{loginError}</Alert>
      }
    </React.Fragment>
  )

}
