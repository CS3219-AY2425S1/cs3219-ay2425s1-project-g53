"use client"

import { Title } from "@mantine/core"

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <Title mx="xl" my="xl">{error.message}</Title>
  )
}
