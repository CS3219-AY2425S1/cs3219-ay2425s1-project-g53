"use client"

import { Attempt, getUserAttempts } from "@/actions/history"
import { Anchor, Table, Text } from "@mantine/core";
import Link from "next/link";
import { UserContext } from "@/lib/contexts";
import { use, useContext, useEffect, useState } from "react";
import { IconDownload } from "@tabler/icons-react";

export default function AttemptTable() {
  const user = use(UserContext);

    if (!user) {
        return (
            <center>Please login to view attempt history.</center>
        );
    }

  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    async function fetchAttempts() {
        if (user) {
            try {
                const userAttempts = await getUserAttempts(user.username);
                setAttempts(userAttempts);
            } catch (err) {
                console.log("Failed to fetch attempts:", err);
            }
        }
    }

    fetchAttempts();
  }, [user]);

  const handleDownload = async (attemptCode: string) => {
    try {
      const blob = new Blob([attemptCode], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'AttemptCode.txt'; // Specify the file name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading attempt code:", err);
    }
  };

  const rows = attempts.map(q => (
    <Table.Tr>
      {/* <Table.Td>{q.id}</Table.Td> */}
      {/* <Table.Td>{q.users[0]}</Table.Td> */}
      <Table.Td>{q.users[1]}</Table.Td>
      <Table.Td>{q.problem}</Table.Td>
      <Table.Td>{q.createdAt}</Table.Td>
      <Table.Td>
        <span
          onClick={() => handleDownload(q.attemptCode)}
          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
        ><IconDownload color="lightblue"></IconDownload>
        </span>
      </Table.Td>
    </Table.Tr>));

  const headers = (
    <Table.Thead>
        <Table.Tr>
            {/* <Table.Th>docId</Table.Th> */}
            {/* <Table.Th>user1</Table.Th> */}
            <Table.Th>Partner</Table.Th>
            <Table.Th>Problem</Table.Th>
            <Table.Th>Attempt Time</Table.Th>
            <Table.Th>View Saved Attempt</Table.Th>
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
