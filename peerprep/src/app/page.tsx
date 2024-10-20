
import { currentUser, logout } from "@/actions/user";
import Home from "@/components/home";
import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  return <Home />
}
