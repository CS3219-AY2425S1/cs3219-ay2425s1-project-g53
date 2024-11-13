import { addQuestion, getCategories } from "@/actions/questions";
import AddQuestionForm from "@/components/add-question-form";
import MarkdownQuestionForm from "@/components/question-form-markdown";
import { Container } from "@mantine/core";

export default async function Page() {
  const categories = await getCategories();

  return (
    <Container fluid h="calc(100vh - 60px)" pt={20} pb={20} >
      <MarkdownQuestionForm categories={categories} onSubmit={addQuestion} />
    </Container>
  )
}
