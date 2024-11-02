import { getUserSessions } from '@/actions/collab';
import { currentUser } from '@/actions/user';
import CodeEditor from '@/components/editor';
import { Container } from '@mantine/core'
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();

  const userSessions = await getUserSessions(user!);
  const sessionName = params.id;

  if (!userSessions.map(s => s.name).includes(sessionName)) {
    return notFound();
  }

  return (
    <Container h="calc(100vh - 60px)">
      <CodeEditor sessionName={sessionName} />
    </Container>
  )
}
