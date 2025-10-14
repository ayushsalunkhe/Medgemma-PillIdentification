import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { createConsultationRequest } from '../services/consultationService';
import { MedicineInfo } from '../types';

interface ConsultationRequestProps {
  medicineInfo: MedicineInfo;
}

const ConsultationRequest: React.FC<ConsultationRequestProps> = ({ medicineInfo, medicineImage }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      toast({
        title: 'Error',
        description: 'Please describe your symptoms',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await createConsultationRequest(medicineInfo, '', symptoms);
      toast({
        title: 'Request Sent',
        description: 'Your consultation request has been sent to doctors',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setSymptoms('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button colorScheme="blue" onClick={onOpen} mt={4}>
        Ask a Doctor
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Doctor Consultation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Describe your symptoms or concerns</FormLabel>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Please describe what you're experiencing and any specific questions you have about this medicine..."
                size="lg"
                rows={6}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConsultationRequest;