
'use client'

import useSWR from 'swr'
import { useForm, zodResolver } from '@mantine/form'
import { addQuestion, Category, Complexity, QuestionAdd, Question } from '@/actions/questions'
import { Box, Button, Grid, LoadingOverlay, MultiSelect, Select, Textarea, TextInput } from '@mantine/core'
import { z } from 'zod'
import { describe } from 'node:test'
import { useFormStatus } from 'react-dom'
import { useDisclosure } from '@mantine/hooks'
import { useEffect } from 'react'

interface FormData {
  title: string,
  description: string,
  categories: string[],
  complexity: Complexity | ""
}

function useCategories() {
  const { data, error, isLoading } = useSWR<Category[], undefined, string>("/api/categories", key => fetch(key).then(res => res.json()));

  return {
    categories: data,
    categoriesLoading: isLoading,
    categoriesError: error
  }
}

function useComplexities() {
  const { data, error, isLoading } = useSWR<Complexity[], undefined, string>("/api/complexities", key => fetch(key).then(res => res.json()));

  return {
    complexities: data,
    complexitiesLoading: isLoading,
    complexitiesError: error
  }
}

export default function AddQuestionForm(props: { categories: Category[], onQuestionCreated?: ((question: Question) => void) }) {
  const [submitting, handlers] = useDisclosure();
  const complexities: Complexity[] = ["Easy", "Medium", "Hard"]

  const schema = z.object({
    title: z.string().min(2, { message: "Title should have at least 2 letters" }),
    description: z.string().min(5, { message: "Description should have at least 5 letters" }),
    categories: z.string().array().nonempty({ message: "Choose at least 1 catetgory" }),
    complexity: z.enum(["Easy", "Medium", "Hard"], { message: "Choose a category" })
  });
  const form = useForm<FormData, (values: FormData) => QuestionAdd>({
    mode: "uncontrolled",
    initialValues: {
      title: "",
      description: "",
      categories: [],
      complexity: ""
    },
    transformValues: values => ({
      ...values,
      categories: values.categories.map(s => ({ name: s })),
      complexity: values.complexity as Complexity
    }),
    validate: zodResolver(schema)
  })

  const handleSubmit = form.onSubmit(v => {
    async function temp() {
      handlers.open();
      // await new Promise(r => setTimeout(r, 3000));
      try {
        const newQuestion = await addQuestion(v);
        form.reset();
        props.onQuestionCreated?.(newQuestion);
      } catch (e) {
        console.log(e);
      }
      handlers.close();
    }
    temp();
  })

  const temp = (
    <form onSubmit={handleSubmit}>
      <Grid>
        <Grid.Col span={4}>
          <TextInput
            placeholder='Title'
            key={form.key("title")}
            {...form.getInputProps("title")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <MultiSelect
            placeholder='Categories'
            data={props.categories.map(c => c.name)}
            key={form.key("categories")}
            {...form.getInputProps("categories")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            placeholder='Complexity'
            data={complexities ?? []}
            key={form.key("complexity")}
            {...form.getInputProps("complexity")}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Textarea
            placeholder='Description'
            key={form.key("description")}
            {...form.getInputProps("description")}
          />
        </Grid.Col>
        <Grid.Col span="content">
          <Box pos="relative">
            <LoadingOverlay visible={submitting} />
            <Button type="submit">
              Add Question
            </Button>
          </Box>
        </Grid.Col>
      </Grid>
    </form>
  )
  return temp;
}  
