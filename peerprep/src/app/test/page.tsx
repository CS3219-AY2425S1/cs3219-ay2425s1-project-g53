import { Container } from "@mantine/core";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import('@/components/editor'), { ssr: false });

export default function Page() {
  return (
    <Container h="calc(100vh - 60px)" >
      <CodeEditor />
    </Container>
  )
}
