import React, { useEffect, useState } from 'react';
import { Modal, Loader, Button, Text, Center } from '@mantine/core';

const MatchTimerModal = ({ opened, onClose, onCancel, onTimeout }: {opened:boolean, onClose:() => void, onCancel: React.MouseEventHandler, onTimeout: () => void}) => {
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
            onTimeout();
            return 0; 
          }
          return prev - 1; 
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Finding Match" withCloseButton={false}>
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
