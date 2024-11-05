import { Question } from "@/actions/questions";
import { Divider, Stack, Badge, Group, ScrollArea, Box, StackProps, Code } from "@mantine/core";
import Markdown from 'react-markdown';
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from 'remark-math'

export default function QuestionDisplay({ question, ...stackProps }: { question: Question} & StackProps) {

  const difficultyBadgeColor = (() => {
    switch (question.complexity) {
      case "Easy":
        return "green";
      case "Medium":
        return "yellow";
      case "Hard":
        return "red";
    }
  })()

  const markdown = (
    <Markdown  remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={{
      code(props){
        return <Code {...props}/>
      }
    }}>{`# ${question.title}\n${question.description}`}</Markdown>
  )

  return (
    <Stack {...stackProps}>
      <Group wrap="nowrap">
        <Group flex="0 0 auto" h="100%">
          <Badge color={difficultyBadgeColor}>{question.complexity}</Badge>
          <Divider size="sm" orientation="vertical" h="100%" />
        </Group>
        <Group>
          {question.categories.map(c => <Badge key={c.id}>{c.name}</Badge>)}
        </Group>
      </Group>
      <Divider />
      <ScrollArea flex="1 1 auto" h={0} >
        {markdown}
      </ScrollArea>
    </Stack>
  )
}
