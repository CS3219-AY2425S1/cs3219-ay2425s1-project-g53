import { getQuestion, Question } from "@/actions/questions";
import { Text, Divider, Stack, Title, Badge, Group, ScrollArea, Flex, Box } from "@mantine/core";

export default async function Page({ params }: { params: { id: number } }) {
  const id = params.id;

  const question: Question = await getQuestion(params.id);

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

  return (
    <Stack py="md" px="md" h="calc(100vh - 60px)">
      <Group wrap="nowrap">
        <Group flex="0 0 auto" h="100%">
          <Title size="xl">{question.title}</Title>
          <Badge color={difficultyBadgeColor}>{question.complexity}</Badge>
          <Divider size="sm" orientation="vertical" />
        </Group>
        <Group>
          {question.categories.map(c => <Badge key={c.id}>{c.name}</Badge>)}
        </Group>
      </Group>
      <Divider />
      <ScrollArea >
        <Text style={{ whiteSpace: "pre-wrap" }}>{question.description}</Text>
      </ScrollArea>
    </Stack>
  )
}
