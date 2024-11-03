"use client"

import { Question } from "@/actions/questions"
import { Anchor, Table, Text } from "@mantine/core";
import Link from "next/link";
import FindMatch from "@/components/find-match";
import Loading from "./loading";
import { useCurrentUser } from "@/lib/hooks/user";

export default function QuestionTable(props: { questions: Question[] }) {
  const { data: user, isLoading } = useCurrentUser();
  if (isLoading) {
    return <Loading h="calc(100vh - 60px)" size={70} />
  }

  const rows = props.questions.map(q => (
    <Table.Tr key={q.id}>
      <Table.Td>{q.id}</Table.Td>
      <Table.Td><Anchor component={Link} href={`/questions/${q.id}`}>{q.title}</Anchor></Table.Td>
      <Table.Td><Text lineClamp={1}>{q.description}</Text></Table.Td>
      <Table.Td>{q.categories.map(c => c.name).join(", ")}</Table.Td>
      <Table.Td>{q.complexity}</Table.Td>
      {user && <Table.Td>
        <FindMatch questionId={q.id} user={user} />
      </Table.Td>}
    </Table.Tr>));

  const headers = (
    <Table.Thead>
      <Table.Tr>
        <Table.Th w="5%">ID</Table.Th>
        <Table.Th w="15%">Title</Table.Th>
        <Table.Th w="50%">Description</Table.Th>
        <Table.Th w="10%">Categories</Table.Th>
        <Table.Th w="5%">Complexities</Table.Th>
        {user && <Table.Th w="5%"></Table.Th>
        }      </Table.Tr>
    </Table.Thead>)

  return (
    <Table.ScrollContainer minWidth="100%">
      <Table stickyHeader striped highlightOnHover layout={"fixed"}>
        {headers}
        <Table.Tbody>
          {rows && rows}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}
