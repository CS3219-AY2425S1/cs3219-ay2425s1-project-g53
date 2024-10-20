import React, { useEffect, useState } from 'react';
import { Modal, Loader, Button, Text } from '@mantine/core';

const MatchTimerModal = ({ opened, onClose, timeout, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    let timer = null;

    if (opened) {
      timer = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Finding Match">
      <Loader />
      <Text>Searching for a match... {seconds}s</Text>
      <Button onClick={onCancel} mt="md">Cancel</Button>
      {timeout && <Text color="red" mt="md">Your match search has timed out.</Text>}
    </Modal>
  );
};

export default MatchTimerModal;