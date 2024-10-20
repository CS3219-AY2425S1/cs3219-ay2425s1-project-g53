import React, { useEffect, useState } from 'react';
import { Modal, Loader, Button, Text } from '@mantine/core';

const MatchTimerModal = ({ opened, onClose, onCancel }) => {
  const [seconds, setSeconds] = useState(30);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    let timer = null;

    if (opened) {
      setSeconds(30); 
      setIsTimeout(false);

      timer = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) { 
            clearInterval(timer);
            setIsTimeout(true);
            return 0; 
          }
          return prev - 1; 
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Finding Match">
      <Loader />
      <Text>Searching for a match... {seconds}s</Text>
      <Button onClick={onCancel} mt="md">Cancel</Button>
      {isTimeout && <Text color="red" mt="md">Your match search has timed out.</Text>}
    </Modal>
  );
};

export default MatchTimerModal;