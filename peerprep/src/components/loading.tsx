// LoadingModal.js
import React from 'react';
import { Modal, Loader, Button } from "@mantine/core";

const LoadingModal = ({ opened, onClose, onCancel }) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Finding Match">
      <Loader />
      <Button onClick={onCancel} mt="md">Cancel</Button>
    </Modal>
  );
};

export default LoadingModal;