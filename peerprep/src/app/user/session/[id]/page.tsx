import { getUserSessions } from '@/actions/collab';
import { currentUser } from '@/actions/user';
import { UserContext } from '@/lib/contexts';
import { Text } from '@mantine/core'
import { notFound, redirect } from 'next/navigation';
import { useContext } from 'react';

export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) {
    redirect("/user/login");
    return <></>
  }

  const userSessions = await getUserSessions(user);
  const sessionName = params.id;

  if (!userSessions.map(s => s.name).includes(sessionName)) {
    return notFound();
  }

  return <Text>Your session name is {sessionName}</Text>
}
