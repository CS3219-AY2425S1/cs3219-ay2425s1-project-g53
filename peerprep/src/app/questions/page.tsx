import React, { useState, useEffect } from 'react';
import useSWR from 'swr'
import AddQuestionForm from '@/components/add-question-form';
import EditQuestionForm from '@/components/edit-question-form';
import QuestionTable from '@/components/question-table';
import { Category, getCategories, getQuestions, Question } from '@/actions/questions'
import { Box, Stack } from '@mantine/core';


export default async function Page() {
  const [categories, questions] = await Promise.all([getCategories(), getQuestions()]);

  return (
    <Stack px="md" py="md" h="calc(100vh - 60px)">
      <AddQuestionForm categories={categories} />
      <QuestionTable questions={questions} />
    </Stack>
  );
}
