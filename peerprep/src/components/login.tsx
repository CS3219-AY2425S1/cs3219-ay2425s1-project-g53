"use client"

import { currentUser, login, verifyCurrentUser } from "@/actions/user";
import { redirectAction } from "@/actions/utils";
import { pipeResult } from "@/lib/utils";
import { Button, Center, PasswordInput, Stack, TextInput, Text, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface FormData {
  email: string,
  password: string,
}

export default function LoginForm() {

  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const router = useRouter();

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

  async function handleSubmit(data: FormData) {
    const res = await pipeResult(login, data.email, data.password);
    res.match(
      _ => router.replace(redirect),
      err => {
        notifications.show({
          title: "Login Error",
          message: err,
          color: "red",
        });
      }
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} >
      <Stack w={600} >
        <TextInput label="Email" mt="xl" {...form.getInputProps("email")} />
        <PasswordInput label="Password" {...form.getInputProps("password")} />
        <Text size="sm">Don't have an account? <Anchor component={Link} href={`/user/signup?${params}`}>Sign Up</Anchor> instead</Text>
        <Center mt="lg">
          <Button type="submit">Log In</Button>
        </Center>
      </Stack>
    </form>
  )

}
