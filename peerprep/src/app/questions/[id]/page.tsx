import { Question } from "@/actions/questions";
import { Text, Divider, Stack, Title, Badge, Group } from "@mantine/core";

export default async function Page({ params }: { params: { id: number } }) {
  const id = params.id;

  const question: Question = await fetch(`http://localhost:5000/questions/id/${id}`)
    .then(r => r.ok ? r : Promise.reject("Invalid question ID"))
    .then(r => r.json())
    .catch(e => { throw new Error(e) });

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
