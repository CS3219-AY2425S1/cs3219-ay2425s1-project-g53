import React, { useEffect, useState } from 'react';
import { Modal, Loader, Button, Text, Center } from '@mantine/core';

const MatchTimerModal = ({ opened, onClose, onCancel }: {opened:boolean, onClose:() => void, onCancel: React.MouseEventHandler}) => {
  const [seconds, setSeconds] = useState(15);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    let timer: any = null;

    if (opened) {
      setSeconds(15); 
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
      <Center>
        <Loader mr="md" />
        <Text>Searching for a match... {seconds}s</Text>
      </Center>
      <Center>
        <Button onClick={onCancel} mt="md">Cancel</Button>
      </Center>
    </Modal>
  );
};

export default MatchTimerModal;
