import { Box, Center, Container } from "@mantine/core";
import SignupForm from "@/components/signup";

export default async function Page() {
  return (
    <Center h="80vh">
      <SignupForm />
    </Center>
  )
}
