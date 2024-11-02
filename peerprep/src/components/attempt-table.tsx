"use client"

import { Attempt } from "@/actions/history"
import { Anchor, Table, Text } from "@mantine/core";
import Link from "next/link";
import { UserContext } from "@/lib/contexts";
import { use } from "react";

export default function AttemptTable(props: { attempts: Attempt[] }) {
  const user = use(UserContext);

  const rows = props.attempts.map(q => (
    <Table.Tr>
      <Table.Td>{q.users[0]}</Table.Td>
      <Table.Td>{q.users[1]}</Table.Td>
      <Table.Td>{q.problem}</Table.Td>
      <Table.Td>{q.attemptStart}</Table.Td>
      <Table.Td>{q.attemptEnd}</Table.Td>
      <Table.Td>{q.attemptCode}</Table.Td>
    </Table.Tr>));

  const headers = (
    <Table.Thead>
        <Table.Th>user1</Table.Th>
        <Table.Th>user2</Table.Th>
        <Table.Th>problem</Table.Th>
        <Table.Th>attempt_start</Table.Th>
        <Table.Th>attempt_end</Table.Th>
        <Table.Th>attempt_code</Table.Th>
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
