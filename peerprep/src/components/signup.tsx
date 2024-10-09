"use client"

import { redirectAction } from "@/actions/utils";
import { useSignup } from "@/lib/hooks/user";
import { Alert, Button, Center, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from 'zod'



export default function SignupForm() {
  const { signup, signupError } = useSignup("/user/login");

  const schema = z.object({
    username: z.string().min(3, { message: "Username must have at least 3 letters" }).refine(s => !(/\s/).test(s), { message: "No whitespace allowed" }),
    email: z.string().email({ message: "Invalid Email" }),
    password: z.string().min(5, { message: "Password too short" }).refine(s => !(/\s/).test(s), { message: "No whitespace allowed" }),
    confirmPassword: z.string()
  }).refine((e) => e.password === e.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: zodResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit(v => signup(v))}>
      <Stack w={600}>
        <Title order={1} ta="center">Welcome to PeerPrep</Title>
        <TextInput label="Username" mt="xl" {...form.getInputProps("username")} />
        <TextInput label="Email" {...form.getInputProps("email")} />
        <PasswordInput label="Password" {...form.getInputProps("password")} />
        <PasswordInput label="Confirm Password" placeholder="Confirm Password" {...form.getInputProps("confirmPassword")} />
        <Center mt="lg">
          <Button type="submit">Sign Up</Button>
        </Center>
      </Stack>
      {signupError &&
        <Alert color="red" title="Signup Error">{signupError}</Alert>
      }
    </form>
  )

}
