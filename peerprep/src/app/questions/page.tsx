import React, { useState } from 'react';
import { Stack, Button } from '@mantine/core';
import QuestionTable from '@/components/question-table';
import MatchTimerModal from '@/components/match-timer-modal';
import { getCategories, getQuestions } from '@/actions/questions';

export default async function Page() {
  const [categories, questions] = await Promise.all([
    getCategories(),
    getQuestions(),
  ]);

  return (
    <Stack px="md" py="md" h="calc(100vh - 60px)">
      {/* <AddQuestionForm categories={categories} /> */}
      <QuestionTable questions={questions} />

      {/* Render MatchTimer component with state management */}
      <MatchController />
    </Stack>
  );
}

// Client component for managing matching state
function MatchController() {
  const [isMatching, setIsMatching] = useState(false);

  const handleFindMatch = () => {
    setIsMatching(true);
  };

  const handleCancel = () => {
    setIsMatching(false);
  };

  return (
    <>
      <Button onClick={handleFindMatch}>Find Match</Button>
      <MatchTimerModal 
        opened={isMatching} 
        onClose={() => setIsMatching(false)} 
        onCancel={handleCancel} 
      />
    </>
  );
}