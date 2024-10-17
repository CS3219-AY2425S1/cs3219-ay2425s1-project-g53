import CodeEditor from "@/components/editor";
import { Container } from "@mantine/core";



export default function Page() {
  return (
    <Container h="calc(100vh - 60px)" >
      <CodeEditor />
    </Container>
  )
}
