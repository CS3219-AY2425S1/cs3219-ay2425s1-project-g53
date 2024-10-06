import { getQuestion, Question } from "@/actions/questions";
import { Text, Divider, Stack, Title, Badge, Group } from "@mantine/core";

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
    <Stack py="md" px="md">
      <Group>
        <Title size="xl">{question.title}</Title>
        <Badge color={difficultyBadgeColor}>{question.complexity}</Badge>
        <Divider size="sm" orientation="vertical" />
        {question.categories.map(c => <Badge key={c.id}>{c.name}</Badge>)}
      </Group>
      <Divider />
      <Text style={{ whiteSpace: "pre-wrap" }}>{question.description}</Text>
    </Stack>
  )
}
