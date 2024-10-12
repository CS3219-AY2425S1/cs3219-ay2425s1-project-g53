"use client"

import { createUser, currentUser, login, verifyCurrentUser } from "@/actions/user";
import { pipeResult } from "@/lib/utils";
import { Button, Center, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { fromPromise, ok, safeTry } from "neverthrow";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from 'zod'



export default function SignupForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const router = useRouter();

  const schema = z.object({
    username: z.string().min(3, { message: "Username must have at least 3 letters" }).refine(s => !(/\s/).test(s), { message: "No whitespace allowed" }),
    email: z.string().email({ message: "Invalid Email" }),
    password: z.string().min(5, { message: "Password too short" }).refine(s => !(/\s/).test(s), { message: "No whitespace allowed" }),
    confirmPassword: z.string()
  }).refine((e) => e.password === e.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: zodResolver(schema),
  });

  const handleSubmit = async (data: FormData) => {
    const res = await pipeResult(createUser, data);
    await res.match(
      async r => {
        const res = await pipeResult(login, data.email, data.password);
        res.match(
          r => router.replace(redirect),
          e => router.push(`/auth/login?${params}`)
        );
      },
      e => notifications.show({ message: e, title: "Signup Error", color: "red" })
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack w={600} >
        <Title order={1} ta="center">Welcome to PeerPrep</Title>
        <TextInput label="Username" mt="xl" {...form.getInputProps("username")} />
        <TextInput label="Email" {...form.getInputProps("email")} />
        <PasswordInput label="Password" {...form.getInputProps("password")} />
        <PasswordInput label="Confirm Password" placeholder="Confirm Password" {...form.getInputProps("confirmPassword")} />
        <Center mt="lg">
          <Button type="submit">Sign Up</Button>
        </Center>
      </Stack>
    </form>
  )

}
