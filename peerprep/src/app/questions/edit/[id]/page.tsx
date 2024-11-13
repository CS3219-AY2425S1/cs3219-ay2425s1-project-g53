import { getCategories, getQuestion, QuestionAdd, updateQuestion } from "@/actions/questions";
import MarkdownQuestionForm from "@/components/question-form-markdown";
import { Container } from "@mantine/core";

export default async function Page({ params }: { params: { id: number } }) {
  const id = params.id;

  const question = await getQuestion(id);
  const categories = await getCategories();

  async function submit(q: QuestionAdd) {
    "use server"
    return await updateQuestion(id, q);
  }

  return (
    <Container fluid h="calc(100vh - 60px)" pt={20} pb={20} >
      <MarkdownQuestionForm question={question} categories={categories} onSubmit={submit} />
    </Container>
  )
}
