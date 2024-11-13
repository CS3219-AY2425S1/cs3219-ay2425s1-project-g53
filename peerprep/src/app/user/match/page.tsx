import { getQuestions } from "@/actions/questions";
import { currentUser } from "@/actions/user";
import Loading from "@/components/loading";
import { MatchForm } from "@/components/match-form";
import { Center, Title } from "@mantine/core";


export default async function MatchPage() {
  const questions = await getQuestions();
  const user = await currentUser();

  if (!user) {
    return <Loading h="100%" size={70} />
  }

  return (
    <Center pt={200}>
      <MatchForm w="60%"  questions={questions} user={user} />
    </Center>
  )
}
