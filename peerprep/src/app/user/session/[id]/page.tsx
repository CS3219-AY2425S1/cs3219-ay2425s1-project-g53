import { getUserSessions } from '@/actions/collab';
import { runCode } from '@/actions/execution';
import { getQuestion } from '@/actions/questions';
import { getCollabWsUrl } from '@/actions/url';
import { currentUser } from '@/actions/user';
import CodeEditor from '@/components/editor';
import Loading from '@/components/loading';
import { TwoHorizontalPanels } from '@/components/panels';
import QuestionDisplay from '@/components/question';
import { Container } from '@mantine/core';
import { notFound } from 'next/navigation';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export default async function Page({ params }: { params: { id: string } }) {
  const url = await getCollabWsUrl();
  const user = await currentUser();

  if (!user) {
    return <Loading />
  }
  const userSessions = await getUserSessions(user!);
  const sessionName = params.id;
  const session = userSessions.find(s => s.name == sessionName);

  if (!session) {
    return notFound();
  }

  const question = await getQuestion(session.question);

  const left = (
    <QuestionDisplay h="100%" px={15} question={question} />
  )

  const right = (
    <Container fluid px={15} py={0} h="100%">
      <CodeEditor sessionName={sessionName} user={user} wsUrl={url} question={question} onRun={async (v, l) => {
        "use server"
        const res = await runCode(l,v);
        if (res.compile) {
          console.log("Compilation:");
          console.log(res.compile.output);
        }
        console.log("Output:")
        console.log(res.run.output);
        // console.log(await runCode(l, v));
      }} />
    </Container>
  )

  return (
    <Container h="calc(100vh - 60px)" fluid py={20}>
      <TwoHorizontalPanels left={left} right={right} persistanceId={`${user?.id}-${session.name}`} />
    </Container>
  )
}
