import React, { useState } from 'react';
import { Stack, Button } from '@mantine/core';
import AttemptTable from '@/components/attempt-table';
import { getUserAttempts } from '@/actions/history';

export default async function Page() {
  return (
    <Stack px="md" py="md" h="calc(100vh - 60px)">
      <AttemptTable />
    </Stack>
  );
}