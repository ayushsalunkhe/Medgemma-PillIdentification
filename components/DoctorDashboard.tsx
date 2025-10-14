import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useToast,
  useDisclosure,
  Image,
} from '@chakra-ui/react';
import { getDoctorConsultations, respondToConsultation } from '../services/consultationService';

interface Consultation {
  id: string;
  userId: string;
  userEmail: string;
  medicineInfo: any;
  medicineImage: string;
  symptoms: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: number;
  response?: {
    doctorId: string;
    doctorEmail: string;
    message: string;
    respondedAt: number;
  };
}

const DoctorDashboard: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const loadConsultations = async () => {
    try {
      const data = await getDoctorConsultations();
      setConsultations(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadConsultations();
    // Set up real-time updates here if needed
  }, []);

  const handleRespond = async () => {
    if (!selectedConsultation || !response.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a response',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await respondToConsultation(selectedConsultation.id, response);
      toast({
        title: 'Success',
        description: 'Your response has been sent',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setResponse('');
      loadConsultations();
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

  const handleConsultationClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    onOpen();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Doctor's Dashboard</Heading>
      <VStack spacing={4} align="stretch">
        {consultations.map((consultation) => (
          <Box
            key={consultation.id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            cursor="pointer"
            onClick={() => handleConsultationClick(consultation)}
            _hover={{ bg: 'gray.50' }}
          >
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">From: {consultation.userEmail}</Text>
                <Text noOfLines={2}>Symptoms: {consultation.symptoms}</Text>
                <Badge
                  colorScheme={
                    consultation.status === 'pending'
                      ? 'yellow'
                      : consultation.status === 'responded'
                      ? 'green'
                      : 'gray'
                  }
                >
                  {consultation.status}
                </Badge>
              </VStack>
              <Text color="gray.500">
                {new Date(consultation.createdAt).toLocaleDateString()}
              </Text>
            </HStack>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Consultation Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedConsultation && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">Patient Email:</Text>
                  <Text>{selectedConsultation.userEmail}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Medicine Information:</Text>
                  <Text>
                    Medicine Name: {selectedConsultation.medicineInfo.name}
                    {selectedConsultation.medicineInfo.activeIngredients && (
                      <>
                        <br />
                        Active Ingredients: {
                          Array.isArray(selectedConsultation.medicineInfo.activeIngredients)
                            ? selectedConsultation.medicineInfo.activeIngredients.join(', ')
                            : selectedConsultation.medicineInfo.activeIngredients
                        }
                      </>
                    )}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">Patient's Symptoms:</Text>
                  <Text>{selectedConsultation.symptoms}</Text>
                </Box>

                {selectedConsultation.response ? (
                  <Box>
                    <Text fontWeight="bold">Your Previous Response:</Text>
                    <Text>{selectedConsultation.response.message}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Responded on: {new Date(selectedConsultation.response.respondedAt).toLocaleString()}
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    <Text fontWeight="bold">Your Response:</Text>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      rows={6}
                    />
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            {selectedConsultation && !selectedConsultation.response && (
              <Button
                colorScheme="blue"
                onClick={handleRespond}
                isLoading={isLoading}
              >
                Send Response
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DoctorDashboard;