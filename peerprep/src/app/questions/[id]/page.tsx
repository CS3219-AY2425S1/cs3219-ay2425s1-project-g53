import { getQuestion, Question } from "@/actions/questions";
import QuestionDisplay from "@/components/question";
import { Text, Divider, Stack, Title, Badge, Group, ScrollArea, Flex, Box } from "@mantine/core";
import Markdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import reactGfm from 'remark-gfm';

export default async function Page({ params }: { params: { id: number } }) {
  const id = params.id;

  const question: Question = await getQuestion(params.id);

  return (
    <QuestionDisplay  py={20} h="calc(100vh - 60px)" px={20} question={question} />
  )
}
