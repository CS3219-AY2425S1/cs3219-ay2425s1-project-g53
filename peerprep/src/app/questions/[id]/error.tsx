"use client"

import { Title } from "@mantine/core"
import { notFound } from "next/navigation"

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return notFound();
}
