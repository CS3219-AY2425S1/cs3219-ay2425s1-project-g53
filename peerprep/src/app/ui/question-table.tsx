"use client"

import { Question } from "@/app/lib/questions"
import { Table, Text } from "@mantine/core";

export default function QuestionTable(props: { questions: Question[] }) {

  const rows = props.questions.map(q => (
    <Table.Tr key={q.id}>
      <Table.Td>{q.id}</Table.Td>
      <Table.Td>{q.title}</Table.Td>
      <Table.Td><Text lineClamp={1}>{q.description}</Text></Table.Td>
      <Table.Td>{q.categories.map(c => c.name).join(", ")}</Table.Td>
      <Table.Td>{q.complexity}</Table.Td>
    </Table.Tr>));

  const headers = (
    <Table.Thead>
      <Table.Tr>
        <Table.Th w="5%">ID</Table.Th>
        <Table.Th w="15%">Title</Table.Th>
        <Table.Th w="50%">Description</Table.Th>
        <Table.Th w="20%">Categories</Table.Th>
        <Table.Th w="10%">Complexities</Table.Th>
      </Table.Tr>
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
