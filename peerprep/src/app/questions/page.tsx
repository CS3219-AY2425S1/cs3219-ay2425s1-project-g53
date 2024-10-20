import React, { useState } from 'react';
import { Box, Stack, Notification } from '@mantine/core';
import AddQuestionForm from '@/components/add-question-form';
import EditQuestionForm from '@/components/edit-question-form';
import QuestionTable from '@/components/question-table';
import { Category, getCategories, getQuestions, Question } from '@/actions/questions';

export default async function Page() {
  const [categories, questions] = await Promise.all([getCategories(), getQuestions()]);
  
  const [isMatching, setIsMatching] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);

  const handleFindMatch = () => {
    setIsMatching(true);
    setIsTimeout(false);

    // Simulate finding a match
    const timer = setTimeout(() => {
      setIsMatching(false);
      setIsTimeout(true);
    }, 30000); // 30 seconds
  };

  const handleCancel = () => {
    setIsMatching(false);
  };

  return (
    <Stack px="md" py="md" h="calc(100vh - 60px)">
      {/* <AddQuestionForm categories={categories} /> */}
      <QuestionTable questions={questions} />

      <MatchTimer isActive={isMatching} onCancel={handleCancel} />

      <Notification
        title="Timeout"
        opened={isTimeout}
        onClose={() => setIsTimeout(false)}
        color="red"
      >
        Your match search has timed out.
      </Notification>
    </Stack>
  );
}