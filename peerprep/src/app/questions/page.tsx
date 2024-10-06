import React, { useState, useEffect } from 'react';
import useSWR from 'swr'
import AddQuestionForm from '../ui/add-question-form';
import EditQuestionForm from '../ui/edit-question-form';
import QuestionTable from '@/app/ui/question-table';
import { getCategories, getQuestions, Question } from '@/app/lib/questions'
import { Box, Stack } from '@mantine/core';


export default async function Page() {
  // const questions = await getQuestions();
  // const categories = await getCategories();
  const [categories, questions] = await Promise.all([getCategories(), getQuestions()]);

  return (
    <div>
      <Stack px="md" my="md" h="95vh">
        <AddQuestionForm categories={categories} />
        <QuestionTable questions={questions} />
      </Stack>
    </div>);
}
