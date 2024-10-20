import React, { useEffect, useState } from 'react';
import { Modal, Loader, Button, Text } from '@mantine/core';

const MatchTimerModal = ({ opened, onClose, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    let timer = null;

    if (opened) {
      setSeconds(0);
      setIsTimeout(false);

      timer = setInterval(() => {
        setSeconds(prev => prev + 1);
        if (seconds >= 30) {
          clearInterval(timer);
          setIsTimeout(true);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [opened, seconds]);

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